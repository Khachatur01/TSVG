import {Point} from "../../model/Point";

export class Matrix {
  public static rotate(points: Point[], refPoint: Point, angle: number): Point[] {
    angle = -angle * (Math.PI / 180);
    let R = [
      [Math.cos(angle), -Math.sin(angle)],
      [Math.sin(angle), Math.cos(angle)]
    ];

    let pointsArr: number [][] = [[], []];
    for (let point of points) {
      pointsArr[0].push(point.x - refPoint.x);
      pointsArr[1].push(point.y - refPoint.y);
    }

    let rotatedPointsArr = this.multiply(R, pointsArr);

    let result: Point[] = [];

    for (let i = 0; i < pointsArr[0].length; i++) {
      result.push({
        x: rotatedPointsArr[0][i] + refPoint.x,
        y: rotatedPointsArr[1][i] + refPoint.y
      })
    }

    return result;
  }
  public static multiply(a: number[][], b: number[][]) {
    let aNumRows = a.length, aNumCols = a[0].length,
      bNumCols = b[0].length,
      m = new Array(aNumRows);  // initialize array of rows
    for (let r = 0; r < aNumRows; ++r) {
      m[r] = new Array(bNumCols); // initialize the current row
      for (let c = 0; c < bNumCols; ++c) {
        m[r][c] = 0;             // initialize the current cell
        for (let i = 0; i < aNumCols; ++i) {
          m[r][c] += a[r][i] * b[i][c];
        }
      }
    }
    return m;
  }
}
