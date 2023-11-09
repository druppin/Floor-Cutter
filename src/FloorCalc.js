class Floor {
    // #floorToBoardRatio;
    // #min_run;
    #boards = [];
    #check_last_x_length;
    #total_boards = 0;
    #drawing_input //This will be really scuffed
    /**
     * yep
     * This constructors order of parameters is pretty odd for anyone who will be changing
     * all of the values. Luckily I'm the only one using it. Some of this will come in handy later
     * like a button to do the max run = min run -board run will just omit a value for max run.
     *
     * @param floor_run
     * @param floor_width NO GAPS SUBTRACTED
     * @param board_run
     * @param min_run smallest cut to make a board
     * @param spacer_width the width of the gap from the wall
     * @param board_width
     * @param min_overlap the minimum space needed between 2 adjoining board cuts
     * @param min_offset the minimum space a new cut cannot be within based on the cut positions of a
     * number of older cuts made
     * @param precision the fractional value to round to.
     * @param check_lineup the amount of boards to check back on for board joints lining up
     */
    constructor(floor_run, floor_width, board_run = 47.625, board_width = 8,
                min_run = 8, spacer_width = 1 / 8, min_overlap = 4, min_offset = .25,
                precision = 1 / 8, check_lineup = 4) {
        this.floor_run = floor_run;
        this.board_run = board_run;
        this.floor_width = floor_width;
        this.board_width = board_width;
        this.min_run = min_run;
        this.spacer_width = spacer_width;
        this.min_overlap = min_overlap
        this.min_offset = min_offset;
        this.precision = precision;
        this.#check_last_x_length = check_lineup;
        this.#get_board_amounts();
    }

    #get_board_amounts() {
        let whole_boards_possible = Math.round(this.floor_run / this.board_run);
        let gap = (this.floor_run / this.board_run - whole_boards_possible) * this.board_run;
        if ((gap - 2 * this.min_run) > 0) {
            this.#boards.push(whole_boards_possible)
            this.#boards.push((whole_boards_possible - 1))
        } else {
            this.#boards.push((whole_boards_possible - 1))
        }
    }

    /**
     * This method determines the valid ranges boards can be cut within to avoid starters or enders being
     * under a set minimum range.
     * a board_option object contains
     *      board_number: the number of whole boards to use for this row.
     *      min_cut: the minimum cut you may make
     *      max_cut: the maximum cut you may make
     * This method will also determine if there are two ranges of valid cuts you may make, hence why
     * an array is returned
     * @returns {*[]} returns an array of board_option objects
     */
    get_range_boards() {
        let board_options = [];
        this.#boards.forEach((currentValue) => {
            let board_option = {
                board_number: currentValue,
                min_cut: 0,
                max_cut: 0
            }
            let gap = this.floor_run - currentValue * this.board_run;
            if (gap <= this.board_run) {
                board_option.min_cut = this.min_run;
                board_option.max_cut = gap - this.min_run;
            } else if (gap > this.board_run * 2) {
                console.log("The amount of boards calculated to find cuts for : " + currentValue + " is too small" +
                    "\nanother board should be added.");
            } else {
                board_option.min_cut = gap - this.board_run + this.min_run;
                board_option.max_cut = this.board_run - this.min_run;
            }
            board_options.push(board_option);
        })
        return board_options;
    }

    /**
     * This method considers where you should start laying your floor.
     * This method compares the gaps created by placing a board joint along the center of the floor
     * and placing a board along the center
     * whichever uses the space more efficiently and causes a smaller board width cut, or no cut at all, will
     * be returned, as a object
     * length_to_start is the length to the starting edge of the 1st row from halfway_floor+offset
     * board_number is the number of boards, include the ends pieces, to span the width of the room
     * @returns {{length_to_start: number, halfway_floor: number, board_number: number, offset: number}}
     */
    get_width_boards() {
        let width_data = {
            board_number: 0,
            length_to_start: 0,
            halfway_floor: this.floor_width / 2,
            offset: 0
        }
        //Case for board seam on center line
        let floor_to_board_even = (width_data.halfway_floor - this.spacer_width) / this.board_width;
        let partial_percent = [floor_to_board_even - Math.floor(floor_to_board_even)]
        let floor_to_board_odd = ((width_data.halfway_floor - this.spacer_width)
            - this.board_width / 2) / this.board_width;
        partial_percent[1] = floor_to_board_odd - Math.floor(floor_to_board_odd);
        if (partial_percent[0] > 1 && partial_percent[1] > 1) {
            console.log("ERROR in get_width_boards() : Both options somehow require more that 100% of a board")
        }
        //if anything is > 1 it's invalid, so I'll make this -1 for easy comparison
        partial_percent = partial_percent.map((x) => {
            if (x > 1) {
                return -1;
            }
            return x;
        })
        //if something is 0 then the boards fit perfectly
        if (partial_percent[0] > partial_percent[1] && partial_percent[1] !== 0 || partial_percent[0] === 0) {
            width_data.board_number = Math.floor(floor_to_board_even) * 2 + 2;
            width_data.length_to_start = floor_to_board_even * this.board_width;
        } else if (partial_percent[1] === 0 || partial_percent[1] > partial_percent[0]) {
            width_data.board_number = Math.floor(floor_to_board_odd) * 2 + 3;
            width_data.length_to_start = floor_to_board_odd * this.board_width;
            width_data.offset = this.board_width / 2;
        }
        return width_data;
    }

    // //TODO split into another file
    //
    // /**
    //  * This generates a randomized list of starter cuts to make
    //  * they have at least the specified overlap
    //  * boards will not have a chance to have the same cut after #check_last_x_length cuts are made
    //  * @returns {*} list of run cuts to make
    //  */
    // get_random_starters(){
    //     let lengths = [];
    //     this.#drawing_input = [];
    //     return this.#recursive_get_random_starters(this.get_width_boards().board_number, this.get_range_boards(),
    //         lengths)
    // }
    //
    // #recursive_get_random_starters(boards, board_options, board_lengths) {
    //     if(boards === 0){ //Base case
    //         return board_lengths;
    //     }
    //     if (board_lengths.length === 0){ //Edge case, 1st board
    //         let random_board_option = this.#get_random(0, board_options.length - 1)
    //         let board_option = board_options[random_board_option]
    //         board_lengths[0] = this.#get_random_nearest_decimal(board_option.min_cut,
    //             board_option.max_cut, this.precision);
    //         boards = boards - 1
    //
    //         let specification = {
    //             length: board_lengths[0],
    //             width: this.board_width,
    //             ranges: this.#get_first_ranges(board_options)
    //         }
    //         this.#drawing_input.push(specification);
    //
    //         return this.#recursive_get_random_starters(boards, board_options, board_lengths);
    //     }
    //     let random_board_option = this.#get_random(0, board_options.length - 1)
    //
    //     //make the cut range based on the range and the last board length
    //     let cut_range = this.#get_cut_range(board_options[random_board_option],
    //         board_lengths[board_lengths.length-1])
    //
    //     //check to see if the random_board_option produced a valid cut range. If so we must try the other
    //     //board_option, but only if there is another option to check.
    //     if (cut_range.includes(-1) && board_options.length > 1){
    //         random_board_option = Math.abs(random_board_option-1);
    //         cut_range = this.#get_cut_range(board_options[random_board_option], board_lengths[board_lengths.length-1])
    //         if (cut_range.includes(-1)){ //if the other board_option also produced an invalid cut range
    //             console.log("this OTHER range " + random_board_option + " produced an invalid range\nNo other ranges can be made")
    //         }
    //     }
    //     else if(cut_range.includes(-1)){ //Otherwise this will tell me that there was an error in making the range
    //         console.log("Error in range")
    //     }
    //
    //     //this helps get an estimate for the amount of boards the project might need
    //     //This is super basic, and does not consider that some boards may get 2 uses.
    //     //doing an accurate job of this would be hard since I don't cal any ending pieces and would need to
    //     //account for blade curf in some cases, but for most not.
    //     this.#total_boards += (board_options[random_board_option].board_number + 2)
    //     let cut = this.#get_random_nearest_decimal(cut_range[0], cut_range[1], this.precision)
    //
    //     //create a list of ranges that a cut cannot be within
    //     let previous_cut_no_zone = []
    //     let check_last_entries = board_lengths.length - this.#check_last_x_length; //starting pos in list
    //     if (board_lengths.length <= this.#check_last_x_length){
    //         check_last_entries = 0;//then start checking at 0 to list length
    //     }
    //     for (let i = check_last_entries; i < board_lengths.length; i++){ //get the board_lengths
    //         previous_cut_no_zone.push([board_lengths[i] - this.min_offset, board_lengths[i] + this.min_offset]);
    //     }
    //     for (let i = 0; i < previous_cut_no_zone.length; i++){
    //         if (this.#between(cut, previous_cut_no_zone[i])){ //if the current cut is within the offset range
    //             //no zone min value outside acceptable range
    //             if (!this.#between(previous_cut_no_zone[i][0], cut_range)){
    //                 cut = previous_cut_no_zone[i][1]
    //             } else if(!this.#between(previous_cut_no_zone[i][1], cut_range)) { //no zone max value outside acceptable range
    //                 cut = previous_cut_no_zone[i][0]
    //             } else if(Math.abs(cut - previous_cut_no_zone[0]) < Math.abs(cut - previous_cut_no_zone[1])){
    //                 cut = previous_cut_no_zone[i][0]; //then just do to whichever side is closer
    //             } else {
    //                 cut = previous_cut_no_zone[i][1];
    //             }
    //         }
    //     }
    //     if(!this.#between(cut,cut_range)){
    //         console.log("ERROR: cut was within unacceptable lineup range but put outside the acceptable cut range")
    //         console.log(cut)
    //         console.log(cut_range)
    //         console.log(this.#get_cut_range(board_options[0], 12.25))
    //     }
    //
    //     //drawing shit
    //     let specification = {
    //         length: cut,
    //         width: this.board_width,
    //         ranges: [cut_range]
    //     }
    //     this.#drawing_input.push(specification);
    //
    //
    //     board_lengths.push(cut)
    //     boards = boards - 1
    //     return this.#recursive_get_random_starters(boards, board_options, board_lengths);
    // }
    //
    // /**
    //  * This returns a range of values a new board can be cut within given the last cut made
    //  * The method checks the validity of cutting within the board's given range left and right of the last cut
    //  * The method finds the acceptable range to cut within
    //  * @param board_option is an object that holds data about how many whole boards can be used
    //  * and then the max and min cut to make to use that many whole boards along a row.
    //  * @param last_board the run measurement of the last board cut
    //  * @returns {number[]|*[]} range of values to cut the next board within
    //  */
    // #get_cut_range(board_option, last_board){
    //     let range = []
    //     let largest_lefthand_cut = last_board - this.min_overlap;
    //     let smallest_righthand_cut = last_board + this.min_overlap;
    //     if(largest_lefthand_cut > board_option.min_cut){ //if the largest cut I can make on the left is larger than the smallest cut I can make
    //         range[0] = board_option.min_cut; //min range is valid
    //         // console.log("left of cut")
    //         //if the largest lefthand cut is larger than the acceptable max for this many boards
    //         if (largest_lefthand_cut > board_option.max_cut) {
    //             range[1] = board_option.max_cut;
    //         } else if (largest_lefthand_cut <= board_option.max_cut){
    //             range[1] = largest_lefthand_cut;
    //         } else {
    //             range[1] = -1;//causes an error if reached
    //         }
    //         if(range[1] - range[0] > 1){//having low range problems, temp fix?
    //             return range;
    //         } else {
    //             console.log("using other range")
    //         }
    //     }
    //     if (smallest_righthand_cut < board_option.max_cut){//ELSE then the min range should be on the other side of the cut
    //         // console.log("right of cut")
    //         range[1] = board_option.max_cut //the max value should be valid
    //         if(smallest_righthand_cut > board_option.min_cut){
    //             range[0] = smallest_righthand_cut;
    //         } else if (smallest_righthand_cut <= board_option.min_cut){
    //             range[0] = board_option.min_cut
    //         } else {
    //             range[0] = -1;//causes an error if reached
    //         }
    //         return range;
    //     }
    //     return[-1, -1]
    // }
    // #get_random_nearest_decimal(start, end, nearest){
    //     let exponent = this.#len_dec(nearest.toString())
    //     start *= (10**exponent);
    //     end *= (10**exponent);
    //     return Math.floor((Math.floor(Math.random() * (end - start + 1) ) + start)/(10**exponent)/nearest)*nearest;
    // }
    // #len_dec(num) {
    //     return (num.split('.')[1] || []).length;
    // }
    //
    // #get_random(start, end){
    //     return Math.floor(Math.random() * (parseFloat(end) - parseFloat(start) + 1) ) + parseFloat(start);
    // }
    //
    // #between = (x, range) => {
    //     return x >= range[0] && x <= range[1];
    // }//https://plainenglish.io/blog/how-to-check-if-a-value-is-within-a-range-of-numbers-in-javascript
    //
    // get_board_estimate(){
    //     return this.#total_boards;
    // }
    // #toFraction(inputNumber, precision) {
    //     let [int, dec] = inputNumber
    //         .toFixed(precision)
    //         .split(".")
    //         .map(n => +n)
    //
    //     const powerOf10 = 10 ** precision,
    //         gcd = this.#getGCD(dec, powerOf10),
    //         fraction = `${dec/gcd}/${powerOf10/gcd}`;
    //     if(fraction.substring(0,1) == "0"){ //My edit
    //         return int.toString();
    //     }
    //     return int ? `${int} ${fraction}` : fraction
    // };//https://codereview.stackexchange.com/questions/247678/convert-decimal-to-fraction
    //
    // #getGCD(a, b) {
    //     if (!b) return a;
    //
    //     return this.#getGCD(b, a % b);
    // }; //https://codereview.stackexchange.com/questions/247678/convert-decimal-to-fraction
    // get_fractional_random_starters(){
    //     let lengths = [];
    //     lengths = this.#recursive_get_random_starters(this.get_width_boards().board_number, this.get_range_boards(),
    //         lengths)
    //     let Stringlengths = []
    //     for (let i = 0; i < lengths.length; i++){
    //         Stringlengths[i] = this.#toFraction(lengths[i], 5)
    //     }
    //     return Stringlengths;
    // }
    // #get_first_ranges(boardOptions){
    //     let range = []
    //     for (let i = 0; i < boardOptions.length; i++){
    //         range.push([boardOptions[i].min_cut, boardOptions[i].max_cut])
    //     }
    //     return range;
    // }
    get_drawing_input() {
        return this.#drawing_input;
    }

    makeRange(number, offset) {
        return [number - offset, number + offset];
    }

    rangeWithin(x, a) {
        return x[0] <= a[0] && x[1] >= a[1];
    }

    rangeOverlap(x, a) {
        return x[0] <= a[0] && a[1] >= x[1] && a[0] <= x[1];
    }

    /**
     * This takes a number of ranges in and will simplify them if possible into larger ranges
     * ranges must be in the form of [smaller, bigger]
     * ranges cannot be [a, a] where "a" is a real value
     * @param rangeList 2D array of ranges
     * @returns {*} 2D array of simplified ranges
     */
    simplifyRanges(rangeList) {
        for (let i = 0; i < rangeList.length; i++) {
            for (let j = i + 1; j < rangeList.length; j++) {
                if(rangeList[i][0] >= rangeList[i][1] || rangeList[j][0] >= rangeList[j][1]){
                    throw new Error("Cannot accept ranges which start at a greater number and go to a lesser number, or the same number\ni= "
                    + rangeList[i] + "\nj= " + rangeList[j])
                }

                if (this.rangeWithin(rangeList[i], rangeList[j])) {
                    rangeList.splice(j,1);
                    j--;
                } else if (this.rangeWithin(rangeList[j], rangeList[i])) {
                    rangeList.splice(i,1);
                    j--;
                } else{
                    if (this.rangeOverlap(rangeList[i], rangeList[j])) {
                        rangeList.unshift([rangeList[i][0], rangeList[j][1]])
                        rangeList.splice(j,1);
                        rangeList.splice(i+1,1);
                        j--;
                    } else if (this.rangeOverlap(rangeList[j], rangeList[i])) {
                        rangeList.unshift([rangeList[j][0], rangeList[i][1]])
                        rangeList.splice(j,1);
                        rangeList.splice(i+1,1);
                        j--;
                    }
                }
            }
        }
        return rangeList;
    }

    /**
     * Return ranges that are outside the invalid ranges but still in the valid ranges
     * @param validRanges
     * @param invalidRanges
     * @returns {*} the new valid ranges
     */
    inclusiveRange(validRanges, invalidRanges){
        for (let v = 0; v < validRanges.length; v++){
            for (let b = 0; b < invalidRanges.length; b++){
                let B = invalidRanges[b];
                let V = validRanges[v];

                if(V[0] >= V[1] || B[0] >= B[1]){
                    throw new Error("Cannot accept ranges which start at a greater number and go to a lesser number, or the same number\nvalid range= "
                        + V + "\ninvalidRange(just the current range, may be valid)= " + B)
                }

                if(B[0] <= V[0] && B[1] > V[0] && B[1] < V[1]){ //CASE 1
                    validRanges[v][0] = B[1];
                } else if(V[0] < B[0] && V[1] > B[1]){ //CASE 2
                    validRanges.push([B[1], V[1]]);
                    validRanges[v][1] = B[0];
                } else if(B[0] <= V[0] && B[1] >= V[1]){ //CASE 3
                    validRanges.splice(v, 1);
                    v--;//we just deleted the current entry so this makes sense
                    break;
                } else if(V[0] < B[0] && B[1] >= V[1]){ //CASE 4
                    validRanges[v][1] = B[0];
                }
            }
        }
        return validRanges;
    }

    #getLastPossibleEntries(array, last){
        if(last > array.length){
            last = array.length;
        }
        return array.slice(length - last, array.length);
    }
}
