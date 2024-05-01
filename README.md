## Maze Generator Beta 1.2

## Summary and Goal
This application is a simple maze generator. Giuen a set of parameters, it creates a rectangular tile-based maze.
When the player presses play, they can enter the maze currently displayed.

My goal for this assignment was to expand upon the a3 assignment, by making the maze actually playable. In particular,
this assignment was mainly used to finish the foundation necessary for future work on this project.

NOTE: A player can only make an input action every 1.1 seconds. Any other action will be dropped

## Challenges
-Code Refactoring (Cleaning up Code and Preventing Circular Dependency)
I wanted to separate some of my code into separate files in order to make it cleaner. However, just moving my code into a separate file would cause circular dependency issues due to my imports.
I ended up making a middle-man file called actionManager. The server receives requests from the client and then sends a message to the actionManager. The actionManager has access to various other files responsible for
a multitude of things, and can perform these actions. While my code is a lot easier to navigate now, this did take an extremely long time to set up.

-Enemy Behavior
I wanted to set up enemy behavior that was functional and a bit complex, but also allowed flexibility for future modifications.
This took a rather long time as I had to account for multiple situations when designing it.

-Playtesting
Doing tests for this was difficult due to not having an interface to see how my program runs.
So while I believe everything should be working, there may be rare bugs that I haven't noticed due to not being able to visualize things like enemy AI.

## Sample User
Username:User1
Password:ABC
NOTE: USER ABOVE IS LOCAL TO MY MACHINE. Please create your own user.