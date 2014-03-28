# Ferrari and Pup

Roelof de Groot, potatoDie

## Description
Spirograph, Lorenz' strange attractors, it's in these lines, that I'm exploring graphics that emerge as a result of animation. The basic idea is that if you follow an object through time, and imagine it to draw a chalk line on the earth, you'll see lines. And by selecting the right object these lines may be ...interesting... and... beautiful!

The end result of the proces of defining the proposal is rather modest: all there is, is a picture on the wall. In this case I believe the dynamics of code art is best expressed by a serene unobtrusive image.

## Link to Prototype
What I have in mind is illustrated with a mix of the following:

[The spectator](http://codepen.io/potatoDie/pen/BbFht "Happy puppy ignorant of trail")

[Drawing with light](http://codepen.io/potatoDie/pen/Kfpqx "The gravity aspect")

## Example Code
```
function run () {

  for ( var i = 0; i < iterations; i++ ) {
	  Ferrari.move();
  	Puppy.update();
  };
  
  Puppy.draw();
  Ferrari.draw();

}
```
## Links to External Libraries

http://www.greensock.com/gsap-js/

## Images & Videos

![Example Image](project_images/fnp2.png?raw=true "Example Image")
