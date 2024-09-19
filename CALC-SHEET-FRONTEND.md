# Analysis Report on Front End

#### Presented by : Alyssa and Cathy


### Design Patterns


#### 1. MVC
This pattern is the most obvious one for the front end.

Examples:
- Model: the "Cell" file
- View: the "SheetHolder" file
- Controler: "the SpreadSheetController" file

#### 2. Singleton?
There is only one "SpreadSheet" that is in charge of other components.

#### 3.Module Pattern
Example:

The component that handles user's sign in acitivity


### Analysis Questions for front end
#### 1. Multi-Screen Navigation
- In the App.js, it renders different contents depending on whether the user is logged in.
 - If the user is not logged in, the loginPageComponent just show the login part
 - otherwise, we can choose a document to open
 - after choosing a document, we display the SpreadSheet component.

##### Routing set up
- use the fetch method and the url of the document?

##### Handle protected routes
- if a cell is being edited by another user, this user's (edit)call to this url will fail?

#### 2. State Management

##### user state maintained and shared


##### tools used to manage global state

#### 3. API Interation

##### API calls made

##### Data from backend processed and displayed
- DocumentHolder file seems to be called by a server, does it count?
- SpreadSheetClient seems related to fetch request to the server for the spreadsheet, does it count?


##### client updated
- It seems that the SpreadSheetClient will fetch Documents 10 times per second. ???

#### 4. User Interface

##### display different UI components based on user roles

##### cell ownership displayed to the users


### Front end and Back end interaction

#### 1. API request-response flow

#### 2. Real time interaction


### Key challenges and design choices that improve the performance and scalability of the application


Cathy's opinions:
- The way frontend fetch every 0.1 second is not efficient, how about using useEffect to monitor changes?
- The code in the FormulaEvaluator file is poorly documented, so it takes me very long to understand what this file is doing.
- The implementation in the FormulaEvaluator can be improved, for example, use switch statemetns instead of a lot of if/else.
- Is it possible to have a component that has a name different from the file's name? (Still the FormulaEvaluator file)