# Analysis Report on Backend

### Design Patterns

1. **Singleton Pattern**

   In `DocumentServer.ts` file, `DocumentHolder` is only instantiated once and used globally.

   Example: `const documentHolder = new DocumentHolder();`

2. **MVC Pattern**

   - **Model**: Represents the data and business logic (e.g., `DocuemntHolder.ts` and `SheetMemory.ts`)
   - **View**: Frontend Application
   - **Controller**: Express server acts as a controller handling all the incoming requests by providing API interfaces and interacting with the models.

   Example: 

   ```
   // GET /documents
   app.get('/documents', (req: express.Request, res: express.Response) => {
       const documentNames = documentHolder.getDocumentNames();
       res.send(documentNames);
   });
   ```

3. **Observer Pattern**

   The DocumentHolder class is an observer. It observes the changes in the documents and updates the changes in the SheetMemory by calling SpreadSheetController.
   
   When the user polls the server for changes, the server sends the changes to the user.
   



### API Analysis

1. **Creating a Document**
   - **Frontend Action**: User creates a new document.
   - **Backend Endpoint**: `POST /documents/create/:name`
   - **Request**: Sends the document name and username in the request.
   - **Response**: Returns the created document JSON.

2. **Retrieving Document Names**
   - **Frontend Action**: User requests the list of document names.
   - **Backend Endpoint**: `GET /documents`
   - **Request**: No additional parameters.
   - **Response**: Returns a list of document names.

3. **Updating a Document**
   - **Frontend Action**: User updates a document.
   - **Backend Endpoint**: `PUT /documents/:name`
   - **Request**: Sends the document name and username in the request.
   - **Response**: Returns the updated document JSON.

4. **Editing a Cell**
   - **Frontend Action**: User requests to edit a specific cell in a document.
   - **Backend Endpoint**: `PUT /document/cell/edit/:name`
   - **Request**: Sends the document name, user name, and cell identifier in the request.
   - **Response**: Returns the updated document JSON.

5. **Viewing a Cell**
   - **Frontend Action**: User requests to view a specific cell in a document.
   - **Backend Endpoint**: `PUT /document/cell/view/:name`
   - **Request**: Sends the document name, user name, and cell identifier in the request.
   - **Response**: Returns the updated document JSON.

6. **Adding a Token**
   - **Frontend Action**: User adds a token to a document.
   - **Backend Endpoint**: `PUT /document/addtoken/:name`
   - **Request**: Sends the document name, username, and token in the request.
   - **Response**: Returns the updated document JSON.

7. **Adding a Cell**
   - **Frontend Action**: User adds a new cell to a document.
   - **Backend Endpoint**: `PUT /document/addcell/:name`
   - **Request**: Sends the document name, user name, and cell identifier in the request.
   - **Response**: Returns the updated document JSON.

8. **Removing a Token**
   - **Frontend Action**: User removes a token from a document.
   - **Backend Endpoint**: `PUT /document/removetoken/:name`
   - **Request**: Sends the document name and username in the request.
   - **Response**: Returns the updated document JSON.

9. **Clearing a Formula**
   - **Frontend Action**: User clears a formula in a document.
   - **Backend Endpoint**: `PUT /document/clear/formula/:name`
   - **Request**: Sends the document name and username in the request.
   - **Response**: Returns the updated document JSON.

### Real-Time Communication

WebSockets are not being used in this project. Instead, polling is used to check for changes in the documents. The client polls the server at regular intervals to check for changes in the documents. If there are any changes, the server sends the updated document to the client.

Messages are exchanged between the client and server using HTTP requests. The client sends requests to specific endpoints on the server with certain parameters in JSON, and the server processes these requests and sends back responses in JSON as well.

### User Management

No user authentication is implemented in the backend. The server does not verify the identity of the user making the requests. The username is sent from the frontend in the request body, but it is not used for authentication purposes. The server assumes that the username is valid and does not perform any checks to verify the user's identity.

No different user types. 

No mechanism to secure sensitive user data. 

### Middleware and Error Handling

There are three middlewares used in the project:

1. **CORS Middleware**: The cors middleware is used to enable Cross-Origin Resource Sharing.
2. **Body Parser Middleware**: The body-parser middleware is used to parse incoming request bodies in JSON format.
3. **Request Logging Middleware**: A custom middleware function is used to log incoming requests when the debug flag is enabled.

There is no authentication or session management middleware used in the project.

There is no data validation or error handling middleware used in the project. Data like username is manually handled in the function.

### Challenges