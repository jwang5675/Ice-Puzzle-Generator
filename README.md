# Ice Puzzle Generator

## Background

This repo contains the base code for a simple ice puzzle generator. The goal of the ice puzzle game is to reach the ending destination. The ice puzzle game works by allowing players to move in a single direction until they hit a boulder as if they were sliding on ice. After the player hits a boulder, they will be able to move in another direction. 

Motivation: https://www.youtube.com/watch?v=hoCfdfRttT8

[![](img/motivation.png)](https://www.youtube.com/watch?v=hoCfdfRttT8)

## Algorithm

Here, I outline the basic algorithm info to generate such ice path puzzles.

Main Algorithm: Input(m, n, difficulty) where (m, n) is the size of the world grid and (difficulty) is a flag denoting how hard the output maze will be.
1. Generate a (m x n) grid that procedurally places boulders on the grid with some defined threshold (t)
2. Generate a random starting point (s) and ending point (e) on the grid
3. Run a modified BFS starting from (s) until it reaches point (e). The modified BFS traverses edges in one direction until a boulder or a wall is reached as a neighboring node.
4. If (e) is unreachable from (s), repeat steps 1 - 3 until a valid map is generated
5. If a valid map generated from (4) satisfies our (difficulty) constraint, output the map. Otherwise, repeats step 1 - 4.

Some important notes to the algorithm: 

- Algorithm runs in O(kx) where x = number of grid cells (m * n) and k is the number of tries needed to make a valid map
- Algorithm is technically not deterministic and can run forever and the value of k can be infinite
- However, for small grids (m, n < 20) and a small boulder threshold (threshold < 15%) this should not pose a problem on runtime as there would be many possible solutions and running BFS on a small (20 x 20) grid with a few actual neighbors from traversing edges runs very fast.
- Assuming k is small, the algorithm runs in approximately linear time.

Some example inputs and outputs to the algorithm:

## Rendering 

TODO: Implement instance rendering of ice blocks and boulders to generate world and render player spirits with textures

## Gameplay

TODO: Implement a simple game engine that works on short game ticks. Each tick will take in player input and try to move and render new instances of the player.
