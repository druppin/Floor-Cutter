
class Floor {
    #floorToBoardRatio;
    #min_run;
    #boards = [];
    #check_range_alert = 5
    #check_last_x_length = 4;
    #total_boards = 0;
    #denominator = 8;
    #fractions = this.#create_fractions(this.#denominator);
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
     * @param spacer_width
     * @param board_width
     * @param max_run max cut to make a board
     */
    constructor(floor_run, floor_width, board_run = 47.625,
                min_run = 8, spacer_width = 1/8, min_overlap = 4, min_offset = .25,
                board_width = 8) {
        this.floor_run = floor_run;
        this.board_run = board_run;
        this.floor_width = floor_width;
        this.board_width = board_width;
        this.min_run = min_run;
        this.spacer_width = spacer_width;
        this.min_overlap = min_overlap
        this.min_offset = min_offset;
        this.#get_board_amounts();
    }
    #get_board_amounts() {
        let whole_boards_possible = Math.round(this.floor_run/this.board_run);
        let gap = (this.floor_run/this.board_run - whole_boards_possible) * this.board_run;
        if ((gap - 2*this.min_run) > 0) {
            this.#boards.push(whole_boards_possible)
            this.#boards.push((whole_boards_possible-1))
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
                max_cut:0
            }
            let gap = this.floor_run - currentValue * this.board_run;
            if (gap <= this.board_run) {
                board_option.min_cut = this.min_run;
                board_option.max_cut = gap - this.min_run;
            } else if (gap > this.board_run * 2) {
                console.log("The amount of boards calculated to find cuts for : " + currentValue + " is too small" +
                    "\nanother board should be added.");
            }
            else {
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
            halfway_floor: this.floor_width/2,
            offset: 0
        }
        //Case for board seam on center line
        let floor_to_board_even = (width_data.halfway_floor - this.spacer_width)/this.board_width;
        let partial_percent = [floor_to_board_even - Math.floor(floor_to_board_even)]
        let floor_to_board_odd = ((width_data.halfway_floor - this.spacer_width)
            - this.board_width/2)/this.board_width;
        partial_percent[1] = floor_to_board_odd - Math.floor(floor_to_board_odd);
        if(partial_percent[0] > 1 && partial_percent[1] > 1){
            console.log("ERROR in get_width_boards() : Both options somehow require more that 100% of a board")
        }
        //if anything is > 1 it's invalid, so I'll make is zero for easy comparison
        partial_percent = partial_percent.map((x) => {
            if(x > 1){
                return -1;
            }
            return x;
        })
        if (partial_percent[0] > partial_percent[1] && partial_percent[1] !== 0 || partial_percent[0] === 0){
            width_data.board_number = Math.floor(floor_to_board_even) * 2 + 2;
            width_data.length_to_start = floor_to_board_even * this.board_width;
        } else if (partial_percent[1] === 0 || partial_percent[1] > partial_percent[0]){
            width_data.board_number = Math.floor(floor_to_board_odd) * 2 + 3;
            width_data.length_to_start = floor_to_board_odd * this.board_width;
            width_data.offset = this.board_width/2;
        }
        return width_data;
    }

    /**
     * This genrates a randomized list of starter cuts to make
     * they have at least the specified overlap
     * boards will not have a chance to have the same cut after #check_last_x_length cuts are made
     * @returns {*} list of run cuts to make
     */
    get_random_starters(){
        let lengths = [];
        return this.#recursive_get_random_starters(this.get_width_boards().board_number, this.get_range_boards(),
            lengths)
    }

    #recursive_get_random_starters(boards, board_options, lengths) {
        // console.log("\nget rand starters\nboards to make : " + boards)
        // console.log("board options : " + board_options.length)
        // console.log("list of boards cut : " + lengths)
        if(boards === 0){
            // console.log("DONE")
            return lengths;
        }
        if (lengths.length === 0){
            // console.log("\nBASE CASE\n")
            let range_choice = this.#get_random(0, board_options.length - 1)
            console.log("RANGE : " + range_choice);
            let board_option = board_options[range_choice]
            // lengths[0] = (this.#get_random(board_option.min_cut, board_option.max_cut))
            let cut = this.#get_random(board_option.min_cut, board_option.max_cut)

            // add fractional amount
            // let extra_space = board_option.max_cut - cut;
            // if(extra_space >= 1){
            //     cut += this.#fractions[this.#get_random(0, this.#fractions.length - 1)];
            //     //then add fractional amount
            // } else if (extra_space < 1){
            //     let fraction_list_limit = Math.floor(extra_space * this.#denominator);
            //     console.log("upper limit of fraction list is : " + fraction_list_limit);
            //     cut += this.#fractions[this.#get_random(0, fraction_list_limit)];
            // }


            lengths[0] = cut;
            // console.log("first cut : ")
            // console.log(lengths)
            boards = boards - 1
            return this.#recursive_get_random_starters(boards, board_options, lengths);
        }
        let range_choice = this.#get_random(0, board_options.length - 1)

        //make the cut range
        let cut_range = this.#get_ranges(board_options[range_choice], lengths[lengths.length-1])
        console.log("CUT RANGE : " + cut_range);

        //check that the cut range is valid and redo if invalid
        // if (cut_range.includes(-1)){
        //     console.log("this range " + range_choice + " produced an invalid range\nTrying other range")
        // }
        if (cut_range.includes(-1) && board_options.length > 1){
            range_choice = Math.abs(range_choice-1);
            cut_range = this.#get_ranges(board_options[range_choice], lengths[lengths.length-1])
            console.log("CUT RANGE : " + cut_range);
            if (cut_range.includes(-1)){
                console.log("this OTHER range " + range_choice + " produced an invalid range\nNo other ranges can be made")
            }
            // console.log("this OTHER range " + range_choice + " produced an Valid range")
        }
        this.#total_boards += (board_options[range_choice].board_number + 2)
        // else{
        //     alert("no cuts could be made")
        // }
        // // console.log("cut range : " + cut_range);
        // let end_range = () => {
        //     if(cut_range[1] - cut_range[0] < 1){ //Issues when cut range was < 1
        //         return cut_range[0];
        //     }
        //     return cut_range[1]}
        let cut = this.#get_random(cut_range[0], cut_range[1])//TODO make this return non whole number offsets
        // let cut = this.#get_random(cut_range[0], end_range())
        if (cut > cut_range[1]){
            cut = cut_range[1];
        }
        console.log("CUT " + cut)
        console.log("Cut offset " + (lengths[lengths.length - 1] - cut))
        // let extra_space = cut_range[1] - cut;
        // console.log("EXTRA SPACE " + extra_space)
        // if(extra_space >= 1){
        //     cut += this.#fractions[this.#get_random(0, this.#fractions.length - 1)];
        //     //then add fractional amount
        // } else if (extra_space < 1){
        //     let fraction_list_limit = Math.floor(extra_space * this.#denominator);
        //     console.log("upper limit of fraction list is : " + fraction_list_limit);
        //     cut += this.#fractions[this.#get_random(0, fraction_list_limit)];
        // }
        // console.log("cut to make : " + cut + "\n\n")

        //create a list of ranges that a cut cannot be within
        let previous_cut_ranges = []
        let check_last_entries = lengths.length - this.#check_last_x_length;
        if (lengths.length <= this.#check_last_x_length){
            check_last_entries = 0;
        }
        for (let i = check_last_entries; i < lengths.length; i++){
            previous_cut_ranges.push([lengths[i] - this.min_offset, lengths[i] + this.min_offset]);
        }
        // console.log("the ranges that a new cut should not line up with : ")
        // console.log(previous_cut_ranges)
        for (let i = 0; i < previous_cut_ranges.length; i++){
            // console.log(previous_cut_ranges[i])
            if (this.#between(cut, previous_cut_ranges[i])){
                // console.log("range conflict")
                if(Math.abs(cut - previous_cut_ranges[0]) < Math.abs(cut - previous_cut_ranges[1])){
                    cut = previous_cut_ranges[i][0];
                } else {
                    cut = previous_cut_ranges[i][1];
                }
                // console.log("cut to make : " + cut)
            }
        }
        lengths.push(cut)
        // console.log("lengths : ")
        // console.log(lengths)
        boards = boards - 1
        return this.#recursive_get_random_starters(boards, board_options, lengths);
    }

    /**
     * This returns a range of values a new board can be cut within given the last cut made
     * The method checks the validity of cutting within the board's given range left and right of the last cut
     * The method finds the acceptable range to cut within
     * @param board_option is an object that holds data about how many whole boards can be used
     * and then the max and min cut to make to use that many whole boards along a row.
     * @param last_board the run measurement of the last board cut
     * @returns {number[]|*[]} range of values to cut the next board within
     */
    #get_ranges(board_option, last_board){
        let range = []
        let largest_lefthand_cut = last_board - this.min_overlap;
        let smallest_righthand_cut = last_board + this.min_overlap;
        if(largest_lefthand_cut > board_option.min_cut){ //if the largest cut I can make on the left is larger than the smallest cut I can make
            range[0] = board_option.min_cut; //min range is valid
            // console.log("left of cut")
            //if the largest lefthand cut is larger than the acceptable max for this many boards
            if (largest_lefthand_cut > board_option.max_cut) {
                range[1] = board_option.max_cut;
            } else if (largest_lefthand_cut <= board_option.max_cut){
                range[1] = largest_lefthand_cut;
            } else {
                range[1] = -1;//causes an error if reached
            }
            return range;
        }
        else if (smallest_righthand_cut < board_option.max_cut){//ELSE then the min range should be on the other side of the cut
            // console.log("right of cut")
            range[1] = board_option.max_cut //the max value should be valid
            if(smallest_righthand_cut > board_option.min_cut){
                range[0] = smallest_righthand_cut;
            } else if (smallest_righthand_cut <= board_option.min_cut){
                range[0] = board_option.min_cut
            } else {
                range[0] = -1;//causes an error if reached
            }
            return range;
        }
        return[-1, -1]
    }

    #get_random(start, end){
        return Math.floor(Math.random() * (parseFloat(end) - parseFloat(start) + 1) ) + parseFloat(start);
    }

    #between = (x, range) => {
        return x >= range[0] && x <= range[1];
    }//https://plainenglish.io/blog/how-to-check-if-a-value-is-within-a-range-of-numbers-in-javascript

    get_board_estimate(){
        return this.#total_boards;
    }

    #create_fractions(denominator) {
        let fractions = [0, ]
        for (let i = 1; i < denominator; i++){
            fractions[i] = i/denominator;
        }
        return fractions;
    }
}