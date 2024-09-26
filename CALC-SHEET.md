# Analysis Report

## Part 1 Analyse the Design Patterns.


#### 1. MVC

##### Model
Model is the DocumentHolder file.

##### Controller
Controller has two parts, one in frontend, and the other one in backend.

For frontend, document is SpreadSheetClient;
For backend, document is DocumentServer.

##### View
View is the whole front end file, except the SpreadSheetClient file.

#### 2. Singleton?

Sigleton pattern is not used in the whole project, since there is no keywords mentioning provate constructor.
However, the whole idea and process in the backend is only use one DocumentHolder to handle all the documents.

Reference:
https://en.wikipedia.org/wiki/Singleton_pattern

#### 3.Module Pattern

The module design pattern is a structural pattern that encapsulates related code into a single unit, or module, which can be reused and maintained independently. It helps in organizing code by providing a way to keep variables and functions private while exposing only the necessary parts.

Example:
- The component that handles user's sign in acitivity

#### 4. Observer Pattern

- Observer or Publisher-Subscriber: useEffect and useState hooks can be considered as part of observer pattern
  
For example, in the "SpreadSheet.tsx" file.

```
const [formulaString, setFormulaString] = useState(spreadSheetClient.getFormulaString())
  const [resultString, setResultString] = useState(spreadSheetClient.getResultString())
  const [cells, setCells] = useState(spreadSheetClient.getSheetDisplayStringsForGUI());
  const [statusString, setStatusString] = useState(spreadSheetClient.getEditStatusString());
  const [currentCell, setCurrentCell] = useState(spreadSheetClient.getWorkingCellLabel());
  const [currentlyEditing, setCurrentlyEditing] = useState(spreadSheetClient.getEditStatus());
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [serverSelected, setServerSelected] = useState("localhost");

...

// useEffect to refetch the data every 1/20 of a second
  useEffect(() => {
    const interval = setInterval(() => {
      updateDisplayValues();
    }, 50);
    return () => clearInterval(interval);
  });

```
## Part 2 Analyse the backend.

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

Real-Time Communication is communication between frontend and backend.

In this project, webSockets are not being used. Instead, polling is used to check for changes in the documents. The client polls the server at regular intervals to check for changes in the documents. If there are any changes, the server sends the updated document to the client.

Messages are exchanged between the client and server using HTTP requests. The client sends requests to specific endpoints on the server with certain parameters in JSON, and the server processes these requests and sends back responses in JSON as well.

### User Management

1. No user authentication is implemented in the backend. The server does not verify the identity of the user making the requests. The username is sent from the frontend in the request body, but it is not used for authentication purposes. The server assumes that the username is valid and does not perform any checks to verify the user's identity.

2. No different user types.

3. No mechanism to secure sensitive user data.

### Middleware and Error Handling

There are three middlewares used in the project:

1. **CORS Middleware**: The cors middleware is used to enable Cross-Origin Resource Sharing.
2. **Body Parser Middleware**: The body-parser middleware is used to parse incoming request bodies in JSON format.
3. **Request Logging Middleware**: A custom middleware function is used to log incoming requests when the debug flag is enabled.

There is no authentication or session management middleware used in the project.

There is no data validation or error handling middleware used in the project. Data like username is manually handled in the function.

## Part 3 Analyse the frontend. 

#### 1. Multi-Screen Navigation

- In the App.js, it renders different contents depending on whether the user is logged in.
- If the user is not logged in, the loginPageComponent just show the login part
- otherwise, we can choose a document to open
- after choosing a document, we display the SpreadSheet component.


##### Routing set up

- The "App" file uses conditional rendering and URL manipulation to set up routing. It parses the current url. If the current url contains 'documents' or empty, it directs to the login page. Otherwise, it directs to the spreadsheet related pages.

```
  if (documentName === '') {
    setDocumentName('documents');
    resetURL('documents');
  }
  if (documentName === 'documents') {
    return (
      <div className="LoginPage">
        <header className="Login-header">
          <LoginPageComponent spreadSheetClient={spreadSheetClient} />
        </header>
      </div>
    )
  }

  return (
    <div className="App">
      <header className="App-header">
        <SpreadSheet documentName={documentName} spreadSheetClient={spreadSheetClient} />
      </header>

    </div>
  );
  ```

##### Handle protected routes

- The "LoginPageComponent" file protects routes implicitly. It implements a form of conditional rendering based on if the user is logged in. The method of "buildFileSelector" checks if the user is empty. It only allows nonempty user to proceed further.

```
function buildFileSelector() {
    if (userName === "") {
      return <div>
        <h4>Please enter a user name</h4>
        <br />
        You must be logged in to<br />
        access the documents!
      </div>;
    }

    const sheets: string[] = spreadSheetClient.getSheets();
    // make a table with the list of sheets and a button beside each one to edit the sheet
    return <div>
      <table>
        <thead>
          <tr className="selector-title">
            <th>Document Name---</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {sheets.map((sheet) => {
            return <tr className="selector-item">
              <td >{sheet}</td>
              <td><button onClick={() => loadDocument(sheet)}>
                Edit
              </button></td>
            </tr>
          })}
        </tbody>
      </table>
    </div >
  }
```
#### 2. State Management

##### user state maintained and shared

parent-child communication (useState())
There is no Redux or useContext in this project

##### tools used to manage global state

In the "LoginPageComponent" file, useState is used for authentication status and to track whether the user name is empty.
If the user edit its name, setUserName will update userName and pass this value to the variabel of spreadSheetClient. The method of "buildFileSelector" checks the validality of the userName and decide whether to proceed further.

```
  const [userName, setUserName] = useState(window.sessionStorage.getItem('userName') || "");
  const [documents, setDocuments] = useState<string[]>([]);

  ...
  function getUserLogin() {
    return <div>
      <input
        type="text"
        placeholder="User name"
        defaultValue={userName}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            // get the text from the input
            let userName = (event.target as HTMLInputElement).value;
            window.sessionStorage.setItem('userName', userName);
            // set the user name
            setUserName(userName);
            spreadSheetClient.userName = userName;
          }
        }} />
    </div>
  }
  ...
  function buildFileSelector() {
    if (userName === "") {
      return <div>
        <h4>Please enter a user name</h4>
        <br />
        You must be logged in to<br />
        access the documents!
      </div>;
    }

    const sheets: string[] = spreadSheetClient.getSheets();
    // make a table with the list of sheets and a button beside each one to edit the sheet
    return <div>
      <table>
        <thead>
          <tr className="selector-title">
            <th>Document Name---</th>
            <th>Actions</th>

          </tr>
        </thead>
        <tbody>
          {sheets.map((sheet) => {
            return <tr className="selector-item">
              <td >{sheet}</td>
              <td><button onClick={() => loadDocument(sheet)}>
                Edit
              </button></td>
            </tr>
          })}
        </tbody>
      </table>
    </div >
  }

```

In the "SpreadSheet" file, the parent component holds the state variables -"statusString", "userName" , etc. These state variables are used as props to pass down to child components, such as "Sheetholder", and "keyPad". In this project, Redux or Context API are not used for managing global state.

```
return (
    <div>
      <Status statusString={statusString} userName={userName}></Status>
      <button onClick={returnToLoginPage}>Return to Login Page</button>
      <Formula formulaString={formulaString} resultString={resultString}  ></Formula>

      {<SheetHolder cellsValues={cells}
        onClick={onCellClick}
        currentCell={currentCell}
        currentlyEditing={currentlyEditing} ></SheetHolder>}
      <KeyPad onButtonClick={onButtonClick}
        onCommandButtonClick={onCommandButtonClick}
        currentlyEditing={currentlyEditing}></KeyPad>
      <ServerSelector serverSelector={serverSelector} serverSelected={serverSelected} />
    </div>
  )
```

#### 3. API Interation

##### API calls made

- fetch is used in SpreadSheetClient, to set up a different url of the document/user/cell
- axios is imported in LoginPageComponent but not used

for example:
```
 public getDocument(name: string, user: string) {
        // put the user name in the body
        if (name === "documents") {
            return;  // This is not ready for production but for this assignment will do
        }
        const userName = user;
        const fetchURL = `${this._baseURL}/documents/${name}`;
        fetch(fetchURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ "userName": userName })
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }).then((document: DocumentTransport) => {
                this._updateDocument(document);

            });

    }
```

or
```
public setEditStatus(isEditing: boolean): void {

        // request edit status of the current cell
        const body = {
            "userName": this._userName,
            "cell": this._document.currentCell
        };
        let requestEditViewURL = `${this._baseURL}/document/cell/view/${this._documentName}`;
        if (isEditing) {
            requestEditViewURL = `${this._baseURL}/document/cell/edit/${this._documentName}`;
        }

        fetch(requestEditViewURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }).then((document: DocumentTransport) => {
                this._updateDocument(document);
            });
    }
```

##### Data from backend processed and displayed

- SpreadSheetClient seems related to fetch request to the server for the spreadsheet, then it updated its states according to what is fetched from the backend.After the states are updated, the front end will re-render because SpreadSheet used the states in SpreadSheetClient.

```
public setEditStatus(isEditing: boolean): void {

        // request edit status of the current cell
        const body = {
            "userName": this._userName,
            "cell": this._document.currentCell
        };
        let requestEditViewURL = `${this._baseURL}/document/cell/view/${this._documentName}`;
        if (isEditing) {
            requestEditViewURL = `${this._baseURL}/document/cell/edit/${this._documentName}`;
        }

        fetch(requestEditViewURL, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
            .then(response => {
                return response.json() as Promise<DocumentTransport>;
            }).then((document: DocumentTransport) => {
                this._updateDocument(document);
            });
    }
```
The frontend fetchs data from the backend and uses Promise to get the response. It parses the response and translates the response into the format -"DocumentTransport". Then, it passes the processed data for further usage.

Json/data->Parse->Object->something frontend use(model)->controller->view

##### client updated
- It seems that the SpreadSheetClient will fetch Documents 10 times per second.

- The method of "_timedFetch" in the "SpreadSheetClient" file fetches data from the server every 0.1 seconds to ensure different users can see updates.
```
private async _timedFetch(): Promise<Response> {

        // only get the document list every 2 seconds
        let documentListInterval = 20;
        let documentFetchCount = 0;
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                this.getDocument(this._documentName, this._userName);
                documentFetchCount++;
                if (documentFetchCount > documentListInterval) {
                    documentFetchCount = 0;
                    this.getDocuments(this._userName);
                }
                this._timedFetch();
            }, 100);
        });
    }
```

#### 4. User Interface

##### display different UI components based on user roles

##### cell ownership displayed to the users

- displayed in the Status component inside the SpreadSheet component

```
<div>
      <Status statusString={statusString} userName={userName}></Status>
      <button onClick={returnToLoginPage}>Return to Login Page</button>
      <Formula formulaString={formulaString} resultString={resultString}  ></Formula>

      {<SheetHolder cellsValues={cells}
        onClick={onCellClick}
        currentCell={currentCell}
        currentlyEditing={currentlyEditing} ></SheetHolder>}
      <KeyPad onButtonClick={onButtonClick}
        onCommandButtonClick={onCommandButtonClick}
        currentlyEditing={currentlyEditing}></KeyPad>
      <ServerSelector serverSelector={serverSelector} serverSelected={serverSelected} />
    </div>
```
In the "SheetHolder" file, the cellsValue is defined with a label, which is the cell ownership.
```
// a wrapper for the sheet component that allows the sheet to be scrolled
// the sheet is a grid of cells
// the cells are clickable
// the cells have a value
// the cells have a label
// the cells have a class name
// the cells have a style
// the cells have a click handler

interface SheetHolderProps {
  cellsValues: Array<Array<string>>;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  currentCell: string;
  currentlyEditing:boolean
}
```
Then this cellsValues will be wrapped and pass to the "SheetComponent" file.

```
function SheetHolder({ cellsValues, onClick, currentCell, currentlyEditing}: SheetHolderProps) {
  return (
    <div className="sheet-holder">
      <SheetComponent cellsValues={cellsValues} onClick={onClick} currentCell={currentCell}  currentlyEditing={currentlyEditing}  />
    </div>
  );
} // SheetHolder

```
The "SheetComponent" file use the method of "getCellEditor" to get the cell ownership and pass it to the "cell-label".

Morevoer, the ownership of cell will only display when the cell id editing. If the cell is not currently editing, the
```
  function getCellEditor(cell: string) {
    // split on | return the second part
    return cell.split("|")[1];
  }
  
  ...

  return (
    <table className="table">
      <tbody>
        {/*add a row with column cellsValues */}
        <tr>
          <th></th>
          {cellsValues[0].map((col, colIndex) => (
            <th className="column-label" key={colIndex}>
              {Cell.columnNumberToName(colIndex)}
            </th>
          ))}
        </tr>
        {cellsValues.map((row, rowIndex) => (
          <tr key={rowIndex}>
            <td className="row-label"> {Cell.rowNumberToName(rowIndex)}</td>
            {row.map((cell, colIndex) => (
              <td key={colIndex}>
                <button
                  onClick={onClick}
                  value={cell}
                  cell-label={Cell.columnRowToCell(colIndex, rowIndex)}
                  data-testid={Cell.columnRowToCell(colIndex, rowIndex)}
                  className={(getCellClass(Cell.columnRowToCell(colIndex, rowIndex)))}
                >
                  {getCellValue(cell)}
                  <label className="cell-label">{getCellEditor(cell)}</label>
                </button>

              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
```
In the "GlobalDefinitions" file, the attribute of contributingUsers is defined in the format of DocumentTransport.
```
export interface DocumentTransport {
  columns: number;
  rows: number;
  cells: Map<string, CellTransport>;
  formula: string;
  result: string;
  currentCell: string;
  isEditing: boolean;
  contributingUsers: UserEditing[];
  errorOccurred: string;
}
```

In the "SpreadSheetClient" file, the user who is editing the cell will be updated.
```


private _getEditorString(contributingUsers: UserEditing[], cellLabel: string): string {
    for (let user of contributingUsers) {
        if (user.cell === cellLabel) {
            return user.user;
        }
    }
    return '';
}

...

private _updateDocument(document: DocumentTransport): void {
        const formula = document.formula;
        const result = document.result;
        const currentCell = document.currentCell;
        const columns = document.columns;
        const rows = document.rows;
        const isEditing = document.isEditing;
        const contributingUsers = document.contributingUsers;
        const errorOccurred = document.errorOccurred;


        // create the document
        this._document = {
            formula: formula,
            result: result,

            currentCell: currentCell,
            columns: columns,
            rows: rows,
            isEditing: isEditing,
            cells: new Map<string, CellTransport>(),
            contributingUsers: contributingUsers,
            errorOccurred: errorOccurred
        };
        // create the cells
        const cells = document.cells as unknown as CellTransportMap;

        for (let cellName in cells) {

            let cellTransport = cells[cellName];
            const [column, row] = Cell.cellToColumnRow(cellName);
            const cell: CellTransport = {
                formula: cellTransport.formula,
                value: cellTransport.value,
                error: cellTransport.error,
                editing: this._getEditorString(contributingUsers, cellName)
            };
            this._document!.cells.set(cellName, cell);
        }
        if (errorOccurred !== '') {
            this._errorCallback(errorOccurred)
        }

    }
```
## Part 4 Analyse the interaction between the frontend and backend

### Front end and Back end interaction

It happens in controller(s) from frontend and backend, as SpreadSheetClient and DocumentServer.

#### 1. API request-response flow
As included in 2.1 and 3.1, the API request-response flow can be summarized as follows:
- Fetch: The frontend sends a request to the backend using fetch.
- Response: The server receives the request and with endpoints like /document/, request is handled accordingly. A json is returned to the backend controller, which is then processed by the backend model. 
- Update: The frontend controller will update its states and display them in the view. 


#### 2. Real time interaction
Fetch is used in the frontend to poll the server for changes in the documents. The client fetches data from the server every 0.1 seconds to check for updates. If there are any changes, the server sends back the updated document to the client.

observer... useEffect(()=>{}, 100)
getDocument...

### Key challenges and design choices that improve the performance and scalability of the application

**Good point**
1. Modular Design: The backend is well-structured and modular, with separate classes for different functionalities.
2. Error handling: The backend handles errors gracefully and returns appropriate error messages to the client.


**Things to improve**

- The way frontend fetch every 0.1 second is not efficient, how about using useEffect to monitor changes?
- The code in the FormulaEvaluator file is poorly documented, so it takes me very long to understand what this file is doing.
- The implementation in the FormulaEvaluator can be improved, for example, use switch statemetns instead of a lot of if/else.
- Is it possible to have a component that has a name different from the file's name? (Still the FormulaEvaluator file)

- The format of routing set up is not clear and formal. In the future, it can be improved for better readability.
- The variable naming is confusing. For example, cell label have different values through different files.
- The "SpreadSheetClient" file is included in the "Engine" folder with other backend files. It will be better to be placed with other frontend files.

- Current polling the server by sending HTTP request is inefficient, it can be improved by using WebSockets for real-time communication.
- User management: Implement user authentication and authorization to secure the application and user data.
- Data validation: Implement data validation to prevent malicious input and ensure data integrity.

