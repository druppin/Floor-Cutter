import {Floor} from "./FloorCalc.js";

let myFloor = new Floor(300, 300, 47.625, 8, 20, 1/8, 4, .25, 1/8, 100)
console.log(myFloor.get_range_boards());
console.log(myFloor.get_width_boards())
console.log(myFloor.get_fractional_random_starters())
console.log("estimated boards needed : " + myFloor.get_board_estimate())
// for (let i = 0; i < 30; i++) {
//     // console.log(myFloor.round_to_the_nearest(myFloor.get_random_decimal(0,20.75, 2)), 125);
//     let number = myFloor.get_random_nearest_decimal(0,12, 1/16);
//     console.log(number)
// }

