# Analysis Report on Front End

#### Presented by : Alyssa and Cathy


### Design Patterns


#### 1. MVC

This pattern is the most obvious one for the front end.

Alyssa:

- Model: the "SpreadSheetClient" file
- View: the "SheetHolder" file and "SheetComponent" file
- Controller: the "SpreadSheet" file

Examples:
- Model: the "Cell" file
- View: the "SheetHolder" file
- Controler: "the SpreadSheetController" file

Alyssa:
- Model: the "SpreadSheetClient" file
- View: the "SheetHolder" file and "SheetComponent" file
- Controller: the "SpreadSheet" file

#### 2. Singleton?
The singleton design pattern ensures that a class has only one instance and provides a global point of access to that instance. This pattern is useful for managing shared resources or configurations where only one instance should exist.

Example:

- There is only one "SpreadSheet" that is in charge of other components.


Alyssa:
https://en.wikipedia.org/wiki/Singleton_pattern
```
More specifically, the singleton pattern allows classes to:[2]

Ensure they only have one instance
Provide easy access to that instance
Control their instantiation (for example, hiding the constructors of a class)
```
Based on the description from Wikipedia, we need to have a instance established and the property of the single instance is static. In the "SpreadSheet" file, I cannot find anything related to these two characteristic. I would prefer to recognize the "SpreadSheet" file as the controller but it does not have a singleton pattern. Could you explain more about your understanding regarding this topic?

#### 3.Module Pattern
Cathy:
The module design pattern is a structural pattern that encapsulates related code into a single unit, or module, which can be reused and maintained independently. It helps in organizing code by providing a way to keep variables and functions private while exposing only the necessary parts.

Example:

- The component that handles user's sign in acitivity

Alyssa:
- Observer or Publisher-Subscriber: useEffect and useState hooks can be considered as part of observer pattern
For example, in the "SpreadSheet" file.

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

If these variables change, the component will re-render to reflect the updated state.

- Model-View-Controller (MVC):
As mentioned before, in the front-end we have the "SpreadSheet" as controller, "SpreadSheetClient" as model and "SheetHolder" and "SheetComponent" as view.

### Analysis Questions for front end
#### 1. Multi-Screen Navigation
- In the App.js, it renders different contents depending on whether the user is logged in.
 - If the user is not logged in, the loginPageComponent just show the login part
 - otherwise, we can choose a document to open
 - after choosing a document, we display the SpreadSheet component.


##### Routing set up
Cathy:
- use the fetch method and set up a different url of the document/user/cell?

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

Alyssa:

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
Cathy:
- if a cell is being edited by another user, this user's (edit)call to this url will fail?
- it seems that the fetch/update call would fail at the backend??

Alyssa:
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
##### tools used to manage global state

Alyssa:
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

In the "SpreadSheet" file, the parent component holds the state variables -"statusString", "userName" and etc. These state variables are used as props to pass down to child components, such as "Sheetholder", and "keyPad". In this project, Redux or Context API are not used for managing global state. 
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
- fetch is used in SpreadSheetClient
- axios is imported in LoginPageComponent but not used

##### Data from backend processed and displayed
- DocumentHolder file seems to be called by a server, does it count?
- SpreadSheetClient seems related to fetch request to the server for the spreadsheet, then it updated its states according to what is fetched from the backend.After the states are updated, the front end will re-render.

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

Alyssa:
The frontend fetchs data from the backend and uses Promise to get the response. It parses the response and translates the response into the format -"DocumentTransport". Then, it passes the processed data for further usage.


##### client updated
- It seems that the SpreadSheetClient will fetch Documents 10 times per second. ???

Alyssa:
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


### Front end and Back end interaction

#### 1. API request-response flow

#### 2. Real time interaction


### Key challenges and design choices that improve the performance and scalability of the application


Cathy's opinions:
- The way frontend fetch every 0.1 second is not efficient, how about using useEffect to monitor changes?
- The code in the FormulaEvaluator file is poorly documented, so it takes me very long to understand what this file is doing.
- The implementation in the FormulaEvaluator can be improved, for example, use switch statemetns instead of a lot of if/else.
- Is it possible to have a component that has a name different from the file's name? (Still the FormulaEvaluator file)