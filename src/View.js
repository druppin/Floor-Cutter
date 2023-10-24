// import {Floor} from "./FloorCalc.js"

window.onload = () => {
    let myFloor = new Floor(168, 144)
    console.log(myFloor.get_range_boards());
    console.log(myFloor.get_width_boards())
    console.log(myFloor.get_random_starters())
    console.log("estimated boards needed : " + myFloor.get_board_estimate())
}