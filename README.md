# StudentResultManagementSystem

visit https://bharathgowdab.github.io/StudentResultManagementSystem/
to view index.html. Only viewing no functioning since it is a static page

You require Oracle SQL server for database (or any other Database but need to change oracledb.js in backend/Manager folder to work with selected database)
You require NodeJS
  including modules express, oracledb, multer, http, https...

To run the program :
  first change path variable in backend/Manager/manager.js relative to your computer
  Then change user and password in backend/Manager/oracledb.js, the same user,password should be able to login to sql server
  Sometimes an additional software OracleInstaClient is required to connect to SQL
  
  run "node backend/server.js" in terminal. (This will start the server at port 80 and port 443)
  
  Go to chrome search http://localhost or https://localhost
