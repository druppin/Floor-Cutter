// const Floor = require("FloorCalc");
let formInputs;
let myFloor;

function GoClickHandler() {
    let errors = document.getElementById("errors");
    errors.innerText = '';
    let basicInputError = false;
    // let inputDetailsList = [];
    for (let i = 0; i < formInputs.length; i++) {
        let inputDetails = verifyInput(formInputs[i]);
        if(inputDetails.error){
            errors.innerHTML += inputDetails.title + " " + inputDetails.message + ", ";
            if(!basicInputError){
                basicInputError = true;
            }
        }
    }
    let inputValueError = false;
    let floor_run = parseFloat(document.getElementById('total_floor_run').value);
    let floor_width = parseFloat(document.getElementById('total_floor_width').value);
    let board_run = parseFloat(document.getElementById("board_run").value);
    let board_width = parseFloat(document.getElementById("board_width").value);
    let min_run = parseFloat(document.getElementById("min_run").value);
    if(min_run >= board_run/2 || min_run > floor_run){
        inputValueError = true;
        errors.innerHTML += "min run must be less than half of the board run and less than the floor run, "
    }
    let min_overlap = document.getElementById("min_overlap").value;
    if(min_overlap > min_run){
        inputValueError = true;
        errors.innerHTML += "min overlap run must be less than the min run, "
    }
    let spacer_width = document.getElementById("spacer_width").value;
    if(spacer_width > floor_run/2 || spacer_width > floor_width/2){
        inputValueError = true;
        errors.innerHTML += "unreasonable value for space width, " +
            "should be much less than half the floor dimensions,"
    }
    let min_offset = document.getElementById("min_offset").value;
    if(min_offset > board_run){
        inputValueError = true;
        errors.innerHTML += "min offset must be less than the board run!, "
    }
    let precision = document.getElementById("precision").value;
    let check_lineup = document.getElementById("check_lineup").value;
    if(!inputValueError && !basicInputError){
        myFloor = new Floor(floor_run, floor_width,board_run, board_width, min_run, spacer_width,
            min_overlap, min_offset, precision, check_lineup);
        makeFloorRanges(myFloor);
        console.log(myFloor.get_range_boards());
        console.log(myFloor.get_width_boards())
        console.log(myFloor.get_random_starters())
        console.log("estimated boards needed : " + myFloor.get_board_estimate())
    }
}

window.onload = () => {
    formInputs = document.getElementsByClassName("input-group")
    // console.log(formInputs)
    document.getElementById("go").onclick = GoClickHandler


}
const verifyInput = (element) => {
    let formControl = element.querySelector('.form-control');
    let error = false;
    let message;
    let title = element.firstElementChild.innerText.replace(/[\r\n]+/gm, " ");
    // title = title;
    if(typeof(formControl.value) === 'number'){
        error = true;
        message = "value must be a number"
    }
    else if(formControl.value <= 0){
        error = true;
        message = "value must be > 0"
    }
    if (error === true){
        formControl.style = "background-color: red";
    }
    else {
        formControl.style = "background-color: none";
    }
    let inputDetails = {
        "element": element,
        "error": error,
        "title": title,
        "message": message
    }
    return inputDetails;
}
const makeFloorRanges = (FloorObject) => {
    let boardOptions = FloorObject.get_range_boards();
    let title;
    let display = document.getElementById('board_range_area');
    display.innerHTML = "";
    for (let i = 0; i < boardOptions.length; i++) {
        title = document.createElement('h2');
        title.innerText = boardOptions[i].board_number + " Boards"
        let min_cut = document.createElement('p');
        min_cut.innerText = "min: " + boardOptions[i].min_cut;
        let max_cut = document.createElement('p');
        max_cut.innerText = "max: " + boardOptions[i].max_cut;
        document.getElementById('board_range_area').append(title, min_cut,max_cut)
    }

}