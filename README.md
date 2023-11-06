# Floor-Cutter 11/6/2023
documenting progress on my personal project
## visulizer branch
This version has a working visulizer, but it points out glaring issues in my code :( (maybe this should be :) )  
### Errors
My code FAILS to generate starter cuts for multi range boards  
my code FAILS to make a good cut if the first range is determined to be valid, but a cut cannot be made in the range due to other recent cuts  
### Solution...?
Honestly, my code is really #@!% messy, and it needs a cleanup! There are just too many methods to go through and the recursive method is doing way too much at once.  
What I need is a restart. My recursive method needs to use more methods to make it easier to read. I need to do better testing with the methods too  
I need a way to simplify where you cannot cut in the beginning. It's not working well when I tell the program to make a cut based on a previous range... then check if that cut acutally works!  
Instead what I think I should try is to identify where I cannot cut, then use that to tell my program where it can cut  
This is no easy task  
#### Baby step 1
The biggest problem I could have is an invalid range, so my first step should be to verify that my range function acutally works.  
My range function should work differently too. It should take in an array of board options, then give my all VALID ranges for the board options. This way I'm only left with the board options
left and right of a cut which are valid, and not only give me the first valid one. Furthermore, (CASE 2) in the event that there is more than one board option, meaning there is more than one valid
range for a board cut to be within, then I can also get that range!  
The event of a CASE 2 should be an edge case. A CASE 2 would just return the min and max board cut in the board option  

clearly I have my work cut out for me, haha pun intended  
but yeah the old range function isn't well thought out, so it's time to make it way better!
