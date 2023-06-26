import SheetMemory from "./SheetMemory"
import Recalc from "./Recalc"
import RecalcDependency from "./RecalcDependency"
import TokenProcessor from "./TokenProcessor";
import Cell from "./Cell";
import CalcSheetServerClient from "../DataStore/src/CalcSheetServerClient";




/**
 *  The main object of the SpreadSheet
 * 
 *  The exported methods are
 * 
 * addToken(token:string):  void
 * 
 * getFormulaString(void): string
 * 
 * getFormulaValue(void): string
 * 
 * setCurrentCell( column:number, row_number)): void
 * 
 * getSheetValues(void): string[][]
 * 
 * 
 * 
 */
export class Machine {

  /** all the private members
   * 
   */

  /** The memory for the sheet */
  private memory: SheetMemory;
  private recalc: Recalc = new Recalc();
  private currentRow = 0;
  private currentColumn = 0;
  private editStatus: boolean = false;

  private portForServer: number = 3005;

  private calcSheetServerClient: CalcSheetServerClient = new CalcSheetServerClient(this.portForServer);


  private tokenProcessor: TokenProcessor = new TokenProcessor();
  private recalcDependency: RecalcDependency = new RecalcDependency();






  constructor(columns: number, rows: number) {
    this.memory = new SheetMemory(columns, rows);
  }

  /**
   * restart the machine
   */
  public restart(): void {
    this.memory = new SheetMemory(this.memory.getMaxColumns(), this.memory.getMaxRows());
    this.currentRow = 0;
    this.currentColumn = 0;
    this.editStatus = false;
    this.tokenProcessor = new TokenProcessor();
    this.recalcDependency = new RecalcDependency();
  }

  /**
   * handle a key press
   *  
   *  @param key:string
   */
  public processKey(key: string): void {

    // if the key is a number or a parenthesis or a decimal point add it to the formula
    if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "(", ")"].includes(key)) {
      this.addToken(key);
      this.editStatus = true;
      this.recalcDependency.evaluateSheet(this.memory);
      return;
    }

    // if the key is an operator add it to the formula
    if (["+", "-", "*", "/"].includes(key)) {
      this.addToken(key);
      this.editStatus = true;
      this.recalcDependency.evaluateSheet(this.memory);
      return;
    }

    // if the key is backspace or delete remove the last token from the formula
    if (["Backspace", "Delete"].includes(key)) {
      this.removeToken();
      this.editStatus = true;
      this.recalcDependency.evaluateSheet(this.memory);
      return;
    }


  }


  public async processCommandButton(command: string): Promise<void> {
    if (command === 'save') {
      let documentToSend: CalcSheetDocument = {
        numberOfRows: this.memory.getMaxRows(),
        numberOfColumns: this.memory.getMaxColumns(),
        formulas: this.memory.getSheetFormulas(),
      };
      try {
        await this.calcSheetServerClient.sendDocument(documentToSend);
      } catch (error) {
        console.error('error-------->: ' + error);
      }
    }
    if (command === 'load') {
      let documentID = '5366e13f-929b-464e-a408-31c14250daee';
      try {
        let result = await this.calcSheetServerClient.getDocument(documentID);
        if (result) {
          let newFormulas = result.formulas;

          this.memory.setSheetFormulas(newFormulas);

          this.recalcDependency.updateDependencies(this.memory);
          this.recalcDependency.evaluateSheet(this.memory);
        } else {
          console.error('document not found');
        }
      } catch (error) {
        console.error('error-------->: ' + error);
      }
    }
  }

  /**  
   *  add token to current formula
   * 
   * @param token:string
   * Inform the memory that the current cell formula has changed
   * 
   */
  addToken(token: string): void {

    this.tokenProcessor.addToken(token);
    this.memory.setCurrentCellFormula(this.tokenProcessor.getFormula());
    let validAddition = this.recalcDependency.updateDependencies(this.memory);
    if (!validAddition) {
      this.removeToken();
    }
    this.recalcDependency.evaluateSheet(this.memory);



  }

  /**  
   *  add cell reference to current formula
   * 
   * @param cell:string
   * Assuming that the dependents have been updated
   * we will look at the dependsOn array for the cell being inserted
   * if the current cell is in the dependsOn array then we have a circular reference
   * 
   */
  addCell(cell_reference: string): void {

    // get the dependents for the cell being inserted

    let cell: Cell = this.memory.getCellByLabel(cell_reference);
    // get the dependents for the current cell
    let dependents = cell.getDependsOn();

    let currentLabel = Cell.columnRowToCell(this.currentColumn, this.currentRow);


    // if the cell reference is not in the dependents use add token
    if (!dependents.includes(currentLabel)) {
      this.addToken(cell_reference);
    } else {
      console.log('circular reference[' + cell_reference + '] not added');
    }
  }


  /**
   * 
   * remove the last token from the current formula
   * 
   */
  removeToken(): void {
    this.tokenProcessor.removeToken();
    this.memory.setCurrentCellFormula(this.tokenProcessor.getFormula());
    this.recalcDependency.evaluateSheet(this.memory);
  }

  /**
   * 
   * clear the current formula
   * 
   */
  clearFormula(): void {
    this.tokenProcessor.setFormula([]);
    this.memory.setCurrentCellFormula(this.tokenProcessor.getFormula());
    this.recalcDependency.evaluateSheet(this.memory);
  }

  /**
   *  Get the formula as a string
   *  
   * @returns the formula as a string
   * 
   * */
  getFormulaString(): string {
    return this.tokenProcessor.getFormulaString();
  }

  /** 
   * Get the formula as a value (formatted to a string)
   *  
   * @returns the formula as a value:string 
   * 
   * */
  getResultString(): string {
    let currentFormula = this.tokenProcessor.getFormula();
    const [, displayString] = this.recalc.evaluate(currentFormula, this.memory);
    return displayString;
  }


  /** 
   * set the working cell by label
   * 
   * @param label:string
   * 
   * 
   */
  setCurrentCellByLabel(label: string): void {
    const [column, row] = Cell.cellToColumnRow(label);
    this.setCurrentCellByCoordinates(column, row);
  }


  /**
   * get the current cell label
   * 
   * @returns the current cell label
   * 
   */
  getCurrentCellLabel(): string {
    return Cell.columnRowToCell(this.currentColumn, this.currentRow);
  }

  /**
   * Set the working cell
   * 
   * @param row:number ß
   * @param column:number
   * 
   * save the formula that is in the tokenProcessor to the current cell
   * 
   * copy the formula from the new cell into the tokenProcessor
   * 
   * */
  setCurrentCellByCoordinates(column: number, row: number): void {
    if (column === this.currentColumn && row === this.currentRow) return;

    let currentFormula = this.tokenProcessor.getFormula();
    this.memory.setCurrentCellFormula(currentFormula);

    this.memory.setCurrentCellCoordinates(column, row);
    currentFormula = this.memory.getCurrentCellFormula();
    this.tokenProcessor.setFormula(currentFormula);

    this.currentColumn = column;
    this.currentRow = row;

    this.memory.setCurrentCellCoordinates(column, row);

  }

  /**
   * Get the Sheet Display Values
   *  
   * @returns string[][]
   */
  public getSheetDisplayStrings(): string[][] {
    return this.memory.getSheetDisplayStrings();
  }

  /**
    * Get the Sheet Display Values
    * the GUI needs the data to be in row major order
    * 
    * @returns string[][]
    */
  public getSheetDisplayStringsForGUI(): string[][] {
    this.recalcDependency.updateComputationOrder(this.memory);
    this.recalcDependency.evaluateSheet(this.memory);

    let memoryDisplayValues = this.memory.getSheetDisplayStrings();
    let guiDisplayValues: string[][] = [];
    let inputRows = memoryDisplayValues.length;
    let inputColumns = memoryDisplayValues[0].length;

    for (let outputRow = 0; outputRow < inputColumns; outputRow++) {
      guiDisplayValues[outputRow] = [];
      for (let outputColumn = 0; outputColumn < inputRows; outputColumn++) {
        guiDisplayValues[outputRow][outputColumn] = memoryDisplayValues[outputColumn][outputRow];
      }
    }


    return guiDisplayValues;

  }

  /**
   * The edit status of the machine specifies what happens when a cell is clicked
   * 
   * @returns boolean
   * 
   * */
  public getEditStatus(): boolean {
    return this.editStatus;
  }

  /**
   * Set the edit status of the machine
   * 
   * @param bool:boolean
   * 
   * */
  public setEditStatus(bool: boolean): void {
    this.editStatus = bool;
  }

  /**
   * Get the edit status string
   *  
   * @returns string
   * 
   * */
  public getEditStatusString(): string {
    if (this.editStatus) {
      return "editing: " + this.getCurrentCellLabel();
    }
    return "current cell: " + this.getCurrentCellLabel();
  }


  /**
   * update the current formula of the machine with the input cell formula
   * 
   * */
  public updateCurrentFormula(cellLabel: string): void {
    const cell = this.memory.getCellByLabel(cellLabel);

    const formula = cell.getFormula();
    this.tokenProcessor.setFormula(formula);
  }




}

export default Machine;