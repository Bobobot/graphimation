import * as THREE from "three";
import { Vector2 } from "three";
import { TweenableNumber, tween } from "../../utils/tweening-utils";

/**
 * Extend this abstract class if you want to create a 2D object that can be added to the scene.
 * Make sure to call init() at the end of your constructor - I have not been able to find a workaround for this.
 */
export abstract class Object2D {
	name: string;
	private hovered: boolean;
	protected highlightBrightnessPlus: TweenableNumber;
	protected highlightScalePlus: TweenableNumber;
	//The position of the object - not necessarily the center, see getCenter()
	protected position: Vector2;
	/**
	 * Represents the third coordinate of the camera's 3D position. Since the Z axis is only used
	 * as a means of deciding whether an object is behind or in front of other objects, it makes
	 * more sense to make the camera's position a vec2 and represent its Z coordinate this way.
	 */
	protected zPos: number;

	//The object's final color and scale will be the sum of the base values and anything else that the subclass may implement
	protected baseColor: THREE.Color;
	protected baseScale: TweenableNumber;

	protected higlightValues = {
		growth: 0.25,
		brightness: 5,
	};

	//Whether the object should react to the user hovering over it
	hoverable = true;
	protected showName: boolean;

	/**
	 * The three.js object that the threejs rendering engine uses
	 * WARN: definite assignment used - remember to define the object in child class
	 */
	protected tObject!: THREE.Object3D;

	constructor(
		x: number,
		y: number,
		name: string,
		color: THREE.Color = new THREE.Color("white")
	) {
		this.position = new Vector2(x, y);
		this.zPos = 0;
		this.baseColor = color;
		this.showName = true;
		this.baseScale = new TweenableNumber(1);

		this.name = name;
		this.highlightBrightnessPlus = new TweenableNumber(0);
		this.highlightScalePlus = new TweenableNumber(0);
		this.hovered = false;
	}

	/**
	 * A method that's called when a user either hovers their cursor over or away from the object.
	 * Will not have any effect if the object's hoverable property is set to false.
	 * @param hover true if the mouse is over the object, false if not
	 */
	hover(hover: boolean): void {
		if (!this.hoverable) return;
		if (hover && !this.hovered) {
			this.hovered = true;
			this.highlight(
				this.higlightValues.brightness,
				this.higlightValues.growth, 25
			);
		} else if (!hover && this.hovered) {
			this.hovered = false;
			this.highlight(0, 0, 25);
		}
	}

	/**
	 * Called when the user clicks on the object.
	 */
	click(): void {
		throw new Error("Method not implemented.");
	}

	/**
	 * Highlights the object by enlargening and brightening it.
	 * Set the first two parameters to 0 to remove the highlight from the object.
	 * @param newHighlightBrightness How much brighter the object should become
	 * @param newHighlightScale How much larger the object should become
	 * @param time The time it takes for the highlight animation. Set to 0 for an instantaneous result
	 */
	private highlight(
		newHighlightBrightness: number,
		newHighlightScale: number,
		time: number = 0
	): void {
		// console.log(this.name);
		//interpolate brightness
		tween(
			this.highlightBrightnessPlus,
			newHighlightBrightness,
			this.updateMesh.bind(this),
			time
		);

		//interpolate scale
		tween(
			this.highlightScalePlus,
			newHighlightScale,
			this.updateMesh.bind(this),
			time
		);
	}

	/**
	 *
	 * @returns The mathematical center of the object.
	 */
	abstract getCenter(): THREE.Vector2;

	/**
	 * Sets it so that this object's mesh has a reference back to this object, its "container".
	 * This attribute is used at raytracing.
	 * Make sure to call this at the end of every child's constructor.
	 */
	protected init() {
		this.tObject.userData = { containerObject: this };
		this.initMesh();
	}

	private initMesh() {
		this.tObject.position.set(this.position.x, this.position.y, this.zPos);
		//TODO: init the rest of the properties
	}

	/**
	 *
	 * @returns The three.js object3D of this object
	 */
	getTHREEObject(): THREE.Object3D {
		return this.tObject;
	}

	/**
	 * Updates the mesh with this object's data, for example colors and position.
	 * This function should usually be the callback function while you're tweening a property of this object.
	 */
	protected updateMesh() {
		this.tObject.position.set(this.position.x, this.position.y, this.zPos);
		

		let newScale = this.baseScale.value + this.highlightScalePlus.value;
		this.tObject.scale.set(newScale, newScale, 1);
	}

	/**
	 * Changes the position of the object, smoothly interpolating between the old and the new value.
	 * @param newPos The new position of the object
	 * @param time The time it takes for the move animation. Set to 0 for an instantaneous result
	 */
	changePosition(newPos: Vector2, time: number = 0) {
		tween(this.position, newPos, this.updateMesh.bind(this), time);
	}

	//NOTE: THREE.Material doesn't have a color attribute, therefore we can't implement this function here
	//We will most likely end up using MeshBasicMaterial for all objects but I'm not sure yet
	/**
	 * Changes the color of the object, smoothly interpolating between the old and the new value.
	 * @param color The new color of the object
	 * @param time The time it takes for the color change animation. Set to 0 for an instantaneous result
	 */
	abstract changeColor(color: THREE.Color, time: number): void;

	/**
	 * Changes the scale of the object, smoothly interpolating between the old and the new value.
	 * @param newScale The new scale of the object
	 * @param time The time it takes for the scaling animation. Set to 0 for an instantaneous result
	 */
	changeScale(newScale: number, time: number = 0): void {
		tween(this.baseScale, newScale, this.updateMesh.bind(this), time);
	}

	/**
	 * Toggles whether the object's name is visible above it or not.
	 */
	toggleName(): void {
		this.showName = !this.showName;
		//TODO: implement the rest
	}

	/**
	 * Updates the object's z position
	 * @param newZ The new z position
	 */
	setZPos(newZ: number): void {
		//If the z position didn't actually change, there's no need to update the mesh
		if (this.zPos == newZ) return;
		this.zPos = newZ;
		this.updateMesh();
	}

	/**
	 *
	 * @returns The material of the threejs Object3D
	 */
	protected getMaterial(): THREE.Material {
		return (this.tObject as THREE.Mesh).material as THREE.Material;
	}

	/**
	 *
	 * @returns The geometry of  the threejs Object3D
	 */
	protected getGeometry(): THREE.BufferGeometry {
		return (this.tObject as THREE.Mesh).geometry;
	}
}
