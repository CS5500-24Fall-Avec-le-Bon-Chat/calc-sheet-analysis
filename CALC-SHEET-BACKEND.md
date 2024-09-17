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
   



### Interactions



### Challenges