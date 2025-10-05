from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sqlite3
import os
from typing import List, Dict, Any
import urllib.parse

# Optional MariaDB support
USE_MARIADB = os.getenv("USE_MARIADB", "false").lower() in ("1", "true", "yes")
MARIADB_URL = os.getenv("MARIADB_URL")  # expected format: mysql+pymysql://user:pass@host:3306/dbname
if USE_MARIADB and MARIADB_URL:
    try:
        import pymysql  # type: ignore
    except Exception:
        raise RuntimeError("pymysql must be installed when USE_MARIADB is enabled")

app = FastAPI(title="Form DB Service")

DATA_DIR = os.path.join(os.path.dirname(__file__), "form_dbs")
os.makedirs(DATA_DIR, exist_ok=True)


def db_path(form_name: str) -> str:
    safe = "_".join(form_name.split())
    return os.path.join(DATA_DIR, f"{safe}.db")


def get_mariadb_conn():
    """Return a pymysql connection based on MARIADB_URL environment variable.

    MARIADB_URL should be a DSN like: mysql://user:pass@host:port/dbname
    """
    if not MARIADB_URL:
        raise RuntimeError("MARIADB_URL not set")
    # simple parse
    # allow mysql:// or mysql+pymysql://
    url = MARIADB_URL
    if url.startswith("mysql+pymysql://"):
        url = url[len("mysql+pymysql://"):]
    elif url.startswith("mysql://"):
        url = url[len("mysql://"):]
    # now url -> user:pass@host:port/db
    parsed = urllib.parse.urlparse("//" + url)
    user = parsed.username or ''
    password = parsed.password or ''
    host = parsed.hostname or 'localhost'
    port = parsed.port or 3306
    db = parsed.path.lstrip('/') or ''
    conn = pymysql.connect(host=host, user=user, password=password, db=db, port=port, charset='utf8mb4', autocommit=False)
    return conn


class CreateForm(BaseModel):
    form_name: str


class ColumnSpec(BaseModel):
    name: str
    type: str = "TEXT"


class CreateTable(BaseModel):
    table: str
    columns: List[ColumnSpec]


class InsertRow(BaseModel):
    row: Dict[str, Any]


@app.post("/forms", status_code=201)
def create_form(f: CreateForm):
    """For sqlite, create a DB file for the form. For MariaDB, ensure the database exists (no-op
    since MARIADB_URL points to a specific database)."""
    p = db_path(f.form_name)
    if USE_MARIADB:
        # When using MariaDB, the concept of a per-form sqlite file doesn't apply. We'll record
        # a marker file so list_forms can still show the form name.
        marker = p + ".mariadb"
        if os.path.exists(marker):
            raise HTTPException(status_code=400, detail="form already exists")
        # create marker file
        with open(marker, 'w') as fh:
            fh.write('mariadb')
        return {"ok": True, "db": "mariadb"}
    else:
        if os.path.exists(p):
            raise HTTPException(status_code=400, detail="form already exists")
        conn = sqlite3.connect(p)
        conn.execute("PRAGMA foreign_keys = ON")
        conn.commit()
        conn.close()
        return {"ok": True, "db": p}


@app.post("/forms/{form_name}/tables", status_code=201)
def create_table(form_name: str, t: CreateTable):
    p = db_path(form_name)
    # basic sanitization for columns
    cols_sql = []
    for c in t.columns:
        cname = ''.join(ch for ch in c.name if ch.isalnum() or ch == '_')
        ctype = c.type.upper() if c.type else 'TEXT'
        cols_sql.append(f"{cname} {ctype}")

    if USE_MARIADB:
        # ensure marker exists for the form
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        # Create table in MariaDB
        create_sql = f"CREATE TABLE IF NOT EXISTS `{t.table}` (id INT PRIMARY KEY AUTO_INCREMENT, " + ', '.join(cols_sql) + ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            cur.execute(create_sql)
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        return {"ok": True, "table": t.table}
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        sql = f"CREATE TABLE IF NOT EXISTS {t.table} (id INTEGER PRIMARY KEY AUTOINCREMENT, " + ', '.join(cols_sql) + ")"
        conn = sqlite3.connect(p)
        try:
            conn.execute(sql)
            conn.commit()
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"ok": True, "table": t.table}


@app.post("/forms/{form_name}/tables/{table}/rows", status_code=201)
def insert_row(form_name: str, table: str, r: InsertRow):
    p = db_path(form_name)
    if USE_MARIADB:
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        keys = list(r.row.keys())
        if not keys:
            raise HTTPException(status_code=400, detail="empty row")
        cols = ','.join(f"`{k}`" for k in keys)
        placeholders = ','.join('%s' for _ in keys)
        values = [r.row[k] for k in keys]
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            cur.execute(f"INSERT INTO `{table}` ({cols}) VALUES ({placeholders})", values)
            conn.commit()
            rowid = cur.lastrowid if hasattr(cur, 'lastrowid') else cur.lastrowid
            cur.close()
            conn.close()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        return {"ok": True, "id": rowid}
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        keys = list(r.row.keys())
        if not keys:
            conn.close()
            raise HTTPException(status_code=400, detail="empty row")
        placeholders = ','.join('?' for _ in keys)
        cols = ','.join(keys)
        values = [r.row[k] for k in keys]
        try:
            cur.execute(f"INSERT INTO {table} ({cols}) VALUES ({placeholders})", values)
            conn.commit()
            rowid = cur.lastrowid
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"ok": True, "id": rowid}


@app.get("/forms/{form_name}/tables/{table}/rows")
def list_rows(form_name: str, table: str, limit: int = 100):
    p = db_path(form_name)
    if USE_MARIADB:
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor(pymysql.cursors.DictCursor) if 'pymysql' in globals() else conn.cursor()
            cur.execute(f"SELECT * FROM `{table}` ORDER BY id DESC LIMIT %s", (limit,))
            rows = []
            for r in cur.fetchall():
                # if using pymysql DictCursor the rows are already dict-like
                rows.append(dict(r))
            cur.close()
            conn.close()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
        return {"rows": rows}
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        conn = sqlite3.connect(p)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        try:
            cur.execute(f"SELECT * FROM {table} ORDER BY id DESC LIMIT ?", (limit,))
            rows = [dict(r) for r in cur.fetchall()]
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"rows": rows}


@app.get("/forms")
def list_forms():
    files = [f for f in os.listdir(DATA_DIR) if f.endswith('.db')]
    forms = [os.path.splitext(f)[0] for f in files]
    # include mariadb markers
    for f in os.listdir(DATA_DIR):
        if f.endswith('.db.mariadb'):
            forms.append(os.path.splitext(os.path.splitext(f)[0])[0])
    return {"forms": forms}


@app.get("/forms/{form_name}/show_tables")
def show_tables(form_name: str):
    p = db_path(form_name)
    if USE_MARIADB:
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            cur.execute("SHOW TABLES")
            rows = [r for r in cur.fetchall()]
            cur.close()
            conn.close()
            return {"tables": rows}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        try:
            cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
            rows = [r[0] for r in cur.fetchall()]
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"tables": rows}


@app.get("/forms/{form_name}/tables/{table}/desc")
def describe_table(form_name: str, table: str):
    p = db_path(form_name)
    if USE_MARIADB:
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            cur.execute(f"DESC `{table}`")
            rows = [r for r in cur.fetchall()]
            cur.close()
            conn.close()
            return {"desc": rows}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        try:
            cur.execute(f"PRAGMA table_info('{table}')")
            rows = [dict(cid=r[0], name=r[1], type=r[2], notnull=r[3], dflt_value=r[4], pk=r[5]) for r in cur.fetchall()]
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"desc": rows}


class UpdatePayload(BaseModel):
    set: Dict[str, Any]
    where: Dict[str, Any]


@app.post("/forms/{form_name}/tables/{table}/update")
def update_rows(form_name: str, table: str, payload: UpdatePayload):
    p = db_path(form_name)
    if USE_MARIADB:
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        set_parts = ",".join(f"`{k}`=%s" for k in payload.set.keys())
        where_parts = " AND ".join(f"`{k}`=%s" for k in payload.where.keys())
        values = list(payload.set.values()) + list(payload.where.values())
        sql = f"UPDATE `{table}` SET {set_parts} WHERE {where_parts}"
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            cur.execute(sql, values)
            conn.commit()
            affected = cur.rowcount
            cur.close()
            conn.close()
            return {"updated": affected}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        set_parts = ",".join(f"{k}=?" for k in payload.set.keys())
        where_parts = " AND ".join(f"{k}=?" for k in payload.where.keys())
        values = list(payload.set.values()) + list(payload.where.values())
        sql = f"UPDATE {table} SET {set_parts} WHERE {where_parts}"
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        try:
            cur.execute(sql, values)
            conn.commit()
            affected = cur.rowcount
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"updated": affected}


@app.post("/forms/{form_name}/tables/{table}/drop")
def drop_table(form_name: str, table: str):
    p = db_path(form_name)
    if USE_MARIADB:
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            cur.execute(f"DROP TABLE IF EXISTS `{table}`")
            conn.commit()
            cur.close()
            conn.close()
            return {"dropped": True}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        try:
            cur.execute(f"DROP TABLE IF EXISTS {table}")
            conn.commit()
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"dropped": True}


@app.post("/forms/{form_name}/drop_database")
def drop_database(form_name: str):
    p = db_path(form_name)
    if USE_MARIADB:
        # dropping database is potentially destructive; run raw DROP DATABASE
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            # drop database name is derived from MARIADB_URL; user must provide the DB name in URL
            # We'll parse the DB name and drop it if present
            parsed = urllib.parse.urlparse("//" + MARIADB_URL.split('://', 1)[-1])
            dbname = parsed.path.lstrip('/')
            if not dbname:
                raise HTTPException(status_code=400, detail="no db name in MARIADB_URL")
            cur.execute(f"DROP DATABASE IF EXISTS `{dbname}`")
            conn.commit()
            cur.close()
            conn.close()
            # remove marker if exists
            marker = p + ".mariadb"
            if os.path.exists(marker):
                os.remove(marker)
            return {"dropped": True, "dropped_db": dbname}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        if os.path.exists(p):
            os.remove(p)
            return {"dropped": True}
        raise HTTPException(status_code=404, detail="form not found")


@app.get("/forms/{form_name}/tables/{table}/export")
def export_table(form_name: str, table: str):
    p = db_path(form_name)
    if USE_MARIADB:
        marker = p + ".mariadb"
        if not os.path.exists(marker):
            raise HTTPException(status_code=404, detail="form not found")
        try:
            conn = get_mariadb_conn()
            cur = conn.cursor()
            cur.execute(f"SELECT * FROM `{table}`")
            cols = [d[0] for d in cur.description]
            rows = [list(r) for r in cur.fetchall()]
            cur.close()
            conn.close()
            return {"columns": cols, "rows": rows}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    else:
        if not os.path.exists(p):
            raise HTTPException(status_code=404, detail="form not found")
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        try:
            cur.execute(f"SELECT * FROM {table}")
            cols = [d[0] for d in cur.description]
            rows = [list(r) for r in cur.fetchall()]
        except Exception as e:
            conn.close()
            raise HTTPException(status_code=500, detail=str(e))
        conn.close()
        return {"columns": cols, "rows": rows}
