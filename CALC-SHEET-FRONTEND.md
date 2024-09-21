# Analysis Report on Front End

#### Presented by : Alyssa and Cathy


### Design Patterns


#### 1. MVC

This pattern is the most obvious one for the front end.

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
The module design pattern is a structural pattern that encapsulates related code into a single unit, or module, which can be reused and maintained independently. It helps in organizing code by providing a way to keep variables and functions private while exposing only the necessary parts.

Example:

- The component that handles user's sign in acitivity


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
- if a cell is being edited by another user, this user's (edit)call to this url will fail?
- it seems that the fetch/update call would fail at the backend??

#### 2. State Management

##### user state maintained and shared


##### tools used to manage global state

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


##### client updated
- It seems that the SpreadSheetClient will fetch Documents 10 times per second. ???

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