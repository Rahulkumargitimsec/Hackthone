#importing liberaries
import tkinter as tk
from tkinter import *
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import pymysql
import crud
#Code Starts Here
print("Basic CRUD OPERATION")
con=pymysql.connect(host="localhost", user="root", password='',
    cursorclass=pymysql.cursors.DictCursor)
try:
    print(con.connection_id())
except:
    print("connection complete")

#installation curobj object
curobj=con.cursor()
def cls():
    print("\n" * 4)
def intro():
    print('''+================================+
    SQL Data Management System (DMS)
+================================+''')
def menu():
    cls()
    intro()
    print(" Select a CRUD operation...")
    print(" 1. Create Database")
    print(" 2. Create table")
    print(" 3. Insert")
    print(" 4. Select All Records") 
    print(" 5. Select columns Conditionally")
    print(" 6. Update")
    print(" 7. Delete table")
    print(" 8. Delete Database")
    print(" 9. Desc table")
    print(" S. Show Tables")
    print(" P. Plot a graph")
    print(" A. Alter")
    print(" E. Export")
    print(" Q. Quit")
    #showtb()
    
def main():
    ch = 0
    menu()
    ch = input("Press 1 to 5 for CRUD or Q to Quit: ")
    if ch == '1':
        createdb()
    elif ch=='s' or ch=='S':
        showtb()
    elif ch == '2':
        createtb()
    elif ch == '3':
        insert()
    elif ch == '4':
        selectall()       
    elif ch == '5':
        selectcon() 
    elif ch == '6':
        update()
    elif ch == '7':
        droptb()
    elif ch=='8':
        dropdb()
    elif ch == '9':
        desctb()
    elif ch=='A' or ch=='a':
        alter()
    elif ch=='P' or ch=='p':
        plot()
    elif ch == 'Q' or ch == 'q' :
        print("Thanks for using DMS!")
    elif ch == 'E' or ch == 'e' :
        export()
    else: 
        print("Invalid choice! Enter a valid option.")
        main() 
    while ch == 'Q' or ch == 'q':
        curobj.close()
        con.close()
        raise SystemExit#terminate the app
    else:
        replayMenu()
def replayMenu():
    startover = ""
    startover = input('...continue (y/n)? ')
    while startover.lower() != 'y':
        print("Thank you for using DMS.")
        break
    else:
        main()
def createdb():
    Q=input("Do you have a Database (y/n): ").lower()
    if Q=='n':
        dname=input("enter the database name: ")
        q1='create database {}'.format(dname)
        curobj.execute(q1)
    elif Q=='y':
        dbn=input("Enter the Database name: ")
        q1='use '+dbn
        curobj.execute(q1)
    else:
        print("Inavalid Choice..")
    
def createtb():
    db=input("enter the database name: ")
    sql1='use {}'.format(db)
    curobj.execute(sql1)
    tb=input("enter the table name: ")
    col=int(input("enter the number of columns: "))
    sql='create table '+tb+'('
    for i in range(col):
        colname=input("enter the column name: ")
        print('''
                1.NUM
                2.Alphabets
                3.Date
                4.Decimal
            ''')
        datatype=input("enter the datatype[num,a lpabets,date,decimal]: ")
        if datatype=='1':
            datatype='int'
        elif datatype=='2':
            datatype='varchar'
        elif datatype=='3':
            datatype='Date'
        elif datatype=='4':
            datatype='decimal'
        else:
            print('Invalid Choice!')
        constraint=input("enter the constraint[blanks space for none]: ")
        if datatype=='decimal':
            x=int(input("enter the characters before decimal point: "))
            y=int(input("enter the characters after decimal point: "))
            size=str(x)+","+str(y)
        elif datatype=='Date':
            pass
        else:
            size=input("enter the lenghth of the column: ")
        #pri=input("enter the the value is primary key or not: ")
        sql= sql +colname+' '+datatype+'('+size+')'+' '+constraint+','
        sql1=sql[:-1]
        #elif datatype=='Date':
            
    sql = sql1 +')'
    print(sql)
    try:
        curobj.execute(sql)
        print('New table created')
    except con.Error as e:
        print("ERROR %d: %s" %(e.args[0], e.args[1]))
def showtb():
    db=input("enter the database name: ")
    sql1='use {}'.format(db)
    curobj.execute(sql1)
    sql="Show tables"
    curobj.execute(sql)
    tbn=curobj.fetchall()
    s1=pd.DataFrame(tbn)
    print('''===================================
            Tables=''',list(s1['Tables_in_'+db])
            ,'===================================')
    #print(s1)
def insert():
    db=input("enter the database name: ")
    sql1='use {}'.format(db)
    curobj.execute(sql1)
    sql3='show tables'
    curobj.execute(sql3)
    result=curobj.fetchall()
    df=pd.DataFrame(result)
    colname=list(df['Tables_in_'+db])
    print('Tables=',colname)
    tbn=input("enter the table name: ")
    sql2='desc {}'.format(tbn)
    curobj.execute(sql2)
    result=curobj.fetchall()
    df=pd.DataFrame(result)
    colname=list(df['Field'])
    #print(colname)

    '''
    ch=int(input("enter the no. of values: "))
    
    for i in range(ch):
        val=input("enter the value: ")
    '''
    sql='insert into '+tbn+' values('
    for i in colname:
        x = input(i+':')
        sql += "'"+x+"',"
    sql = sql[:-1]     
    sql += ')'
    print(sql)
    try:
        curobj.execute(sql)
    except con.Error as e:
        print("ERROR %d: %s" %(e.args[0], e.args[1]))
def selectall():
    db=input("enter the database name: ")
    sql1='use {}'.format(db)
    curobj.execute(sql1)
    #db=input("enter the database name: ")
    #sql1='use {}'.format(db)
    #curobj.execute(sql1)
    sql="Show tables"
    curobj.execute(sql)
    tbnd=curobj.fetchall()
    s1=pd.DataFrame(tbnd)
    print('''Tables=''',list(s1['Tables_in_'+db]))
    tbn=input("enter the table name: ")
    
    sql='select * from {}'.format(tbn)
    curobj.execute(sql)
    record=curobj.fetchall()
    result=pd.DataFrame(record)
    print(result)
    
    '''
    sql1="SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = N'{}'".format(tbn)
    print(sql1)
    curobj.execute(sql1)
    column=curobj.fetchall()
    result.columns=column
    result.index.name='S.no'
    #a=len(result.index)
    #result.index=list(np.arange(1,a))
    #result.columns=curobj.keys()
    #print('roll \t\t name \t\t class')
    print(result)
    '''
def selectcon():
    db=input("enter the database name: ")
    sql1='use {}'.format(db)
    curobj.execute(sql1)
    tbn=input("enter the table name: ")
    print("Table selected")
    coln=int(input("enter the number of columns: "))
    x=''
    for i in range(coln):
        x +=input("enter the name of the column: ")+","
    x=x[:-1]
    sql='Select '+x
    
    #if coln==1:
        #sql=sql[:-1]
    sql=sql +' from {}'.format(tbn)
    curobj.execute(sql)
    record=curobj.fetchall()
    result=pd.DataFrame(record)
    print(result)
    
def export():
    db=input("enter the Database Name: ")
    sql='use {}'.format(db)
    curobj.execute(sql)
    tbn=input("enter the table name: ")
    sql='select * from {}'.format(tbn)
    curobj.execute(sql)
    record=curobj.fetchall()
    result=pd.DataFrame(record)
    df=pd.to_csv(result)
    
def alter():
    db=input("enter the database name: ")
    sql='use {}'.format(db)
    curobj.execute(sql)
    print(" 1.Add Column")
    print(" 2.Drop Column")
    print(" 3.Modify Column")
    print(" 4.Rename Column")
    ch1=input("enter the valid choice: ")
    if ch1=='1':
        tbn=input("enter the table name: ")
        col=input("enter the column name: ")
        dt=input("enter the column type[int,varchar,char etc]: ")
        constraint=input("enter the constraint[leave blank if not any]: ")
        ln=input("enter the length of columns: ")
        sql='Alter table '+tbn+' add column '+col+' '+dt+'('+ln+')'+constraint
        print(sql)
        curobj.execute(sql)
    elif ch1=='2':
        tbn=input("enter the table name: ")
        col=input("enter the column name: ")
        #dt=input("enter the column type[int,varchar,char etc]: ")
        #ln=input("enter the length of columns: ")
        sql='Alter table '+tbn+' drop column '+col
        print(sql)
        curobj.execute(sql)
    elif ch1=='3':
        tbn=input("enter the table name: ")
        col1=input("enter the column name: ")
        dt=input("enter the column type[int,varchar,char etc]: ")
        ln=input("enter the length of columns: ")
        sql='Alter table '+tbn+' modify '+col1+' '+dt+'('+ln+')'
        print(sql)
        curobj.execute(sql)
    elif ch1=='4':
        tbn=input("enter the table name: ")
        col1=input("enter the column name: ")
        col2=input("enter the new column name: ")
        dt=input("enter the new datatype for the column: ")
        size=input("enter the size of the column: ")
        #sql='ALTER TABLE '+tbn+' RENAME COLUMN '+col1+' TO ' +col2
        sql='ALTER TABLE '+tbn+' Change '+col1+" "+col2+" "+dt+'('+size+')'
        print(sql)
        curobj.execute(sql)
    else:
        print('invalid choice')
        main()
def update():
    db=input("enter the database name: ")
    sql='use {}'.format(db)
    curobj.execute(sql)
    tbn=input("enter the table name: ")
    col1=input("enter the column name to update: ")
    val=input("enter the value for the column: ")
    col=input("enter the primary key name in the column: ")
    val2=input("enter the values in the column: ")
    sql='Update '+tbn+' set '+col1+' = '+'"'+val+'"'+' where '+col+'='+val2
    print(sql)
    curobj.execute(sql)
def desctb():
    db=input("enter the database name: ")
    sql='use {}'.format(db)
    curobj.execute(sql)
    tbn=input("enter the table name: ")
    sql='desc {}'.format(tbn)
    curobj.execute(sql)
    result=curobj.fetchall()
    df=pd.DataFrame(result)
    print(df)
def droptb():
    db=input("enter the database name: ")
    sql='use {}'.format(db)
    curobj.execute(sql)
    tbn=input("enter the table name: ")
    sql='DROP TABLE {}'.format(tbn)
    print(sql)
    curobj.execute(sql)
    print("Table successfully Deleted...")
def plot():
    db=input("enter the database name: ")
    sql1='use {}'.format(db)
    curobj.execute(sql1)
    tbn=input("enter the table name: ")
    sql='select * from {}'.format(tbn)
    curobj.execute(sql)
    record=curobj.fetchall()
    result=pd.DataFrame(record)
    column=list(result.columns)
    print('Column Names:',column)
    bartype=input("Enter the bar Type[Bar,Line]: ").lower()
    title=input("enter the title for graph: ")
    x_axis=input("enter the x-axis column name: ")
    y_axis=input("enter the y-axis column name: ")
    colors=input("enter the Bar colours: ")
    x=result[x_axis].tolist()
    y=result[y_axis].tolist()
    plt.title(title)
    if bartype=='bar':
        outline=input('enter the outline color: ')
        plt.bar(x,y,color=colors,width=0.5,edgecolor=outline)
    elif bartype=='line':
        plt.plot(x,y,color=colors)
    else:
        print("Invalid Choice...")
    plt.xlabel(x_axis)
    plt.ylabel(y_axis)
    plt.xticks(x)
    ymin=int(input("enter the minimum y-axis value: "))
    ymax=int(input("enter the maximum y-axis value: "))
    yinter=int(input("enter the interval of y-axis: "))
    plt.yticks(np.arange(ymin,ymax,yinter))
    plt.show()
def dropdb(): 
    db=input("enter the database name to delete: ")
    sql='drop database '+db
    curobj.execute(sql)
    print("Database Successfully Deleted...")
main()
