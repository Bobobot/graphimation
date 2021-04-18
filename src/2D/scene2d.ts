import * as THREE from 'three';
import { IObject2D } from './iobject2d';
import {Camera2D} from './camera2d'

export class Scene2D {
	private scene: THREE.Scene;
	private camera : Camera2D;
	private renderer: THREE.WebGLRenderer

	private width: number;
	private height: number;

	constructor(width: number, height: number) {
		this.scene = new THREE.Scene()
		this.width = width;
		this.height = height;

		this.camera = new Camera2D(width, height);
		
		//set up renderer
		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize(this.width, this.height);

		this.animate();
	}

	addObject(object: IObject2D): void {
		this.scene.add(object.getMesh());
	}

	//returns the dom element of the renderer that can be added to HTML
	getDomElement(): HTMLCanvasElement {
		return this.renderer.domElement;
	}

	private animate(): void {
		//the arrow function is a workaround for javascript's weird behavior when it comes to 'this'
		requestAnimationFrame(this.animate.bind(this));
		this.renderer.render(this.scene, this.camera.getCamera());
	}
}