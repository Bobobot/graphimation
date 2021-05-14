import * as THREE from "three";
import { Vector2, Color } from "three";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial";
import { tween } from "../../utils/tweening-utils";
import { Object2D } from "./object2d";

export abstract class AbstractLine2D extends Object2D {
	protected endPosition: Vector2;

	constructor(
		x1: number,
		y1: number,
		x2: number,
		y2: number,
		name: string,
		color: THREE.Color = new THREE.Color("white")
	) {
		super(x1, y1, name, color);
		this.endPosition = new Vector2(x2, y2);
		this.baseScale.value = 4;
		this.higlightValues.growth = 2;
	}

	protected updateMesh() {
		this.tObject.position.set(this.position.x, this.position.y, this.zPos);
		this.setLineGeometry(this.getGeometry() as LineGeometry);
	}

	protected setLineGeometry(
		geometry: LineGeometry,
		endOffset: number = 0
	): LineGeometry {
		let relativeEndPoint = this.getRelativeEndPoint();
		geometry.setPositions([
			0,
			0,
			this.zPos,
			relativeEndPoint.x - endOffset * relativeEndPoint.x,
			relativeEndPoint.y - endOffset * relativeEndPoint.y,
			this.zPos,
		]);
		return geometry;
	}

	/**
	 * Used internally to set the resolution of the line so that it doesn't look distorted on non 1:1 aspect ratios.
	 * There's probably no reason you'd want to call this function if you're merely using the API.
	 */
	abstract _setResolution(width: number, height: number): void;

	getCenter(): Vector2 {
		return this.position
			.clone()
			.add(this.endPosition.clone())
			.divideScalar(2);
	}

	changeColor(color: THREE.Color, time: number = 0): void {
		tween(this.baseColor, color, this.updateMesh.bind(this), time);
	}

	changeEndPosition(newEndPos: THREE.Vector2, time?: number) {
		tween(this.endPosition, newEndPos, this.updateMesh.bind(this), time);
	}

	changeLine(
		newBasePos: THREE.Vector2,
		newEndPos: THREE.Vector2,
		time: number = 0
	): void {
		this.changePosition(newBasePos, time);
		this.changeEndPosition(newEndPos, time);
	}

	protected getRelativeEndPoint(): Vector2 {
		return new Vector2(
			this.endPosition.x - this.position.x,
			this.endPosition.y - this.position.y
		);
	}
}
