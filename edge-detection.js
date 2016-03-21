(function(){
	$ED = null;
	var _ED = function(){
		var that = {};
				
		that.angleDirection = [];
		that.upperThreshold = 0;
		that.lowerThreshold = 0;
		
		
		//method to return pixel data from passed
		//image object
		that.getPixelData = function(width, height, imageContext, convertToGrayscale){
			var imageData = [];
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					
					var pixel = imageContext.getImageData(x, y, 1, 1);
					pixel = [ pixel.data[0], pixel.data[1], pixel.data[2], pixel.data[3] ];
					
					if(convertToGrayscale === true){
						var grayValue = that.convertPixel2grayscale(pixel);
						pixel[0] = grayValue;
						pixel[1] = grayValue;
						pixel[2] = grayValue;
					}
					imageData[x][y] = pixel;
				}
			}
			return imageData;
		};
		
		
		//converts image data to grayscale...the method takes a parameter
		//of array of 3 values (r,g,b) and returns the array in grayscale
		//average values.
		that.convertPixel2grayscale = function(pixelData){
			return Math.ceil( (pixelData[0] + pixelData[1] + pixelData[2]) / 3  );
		};
		
		
		//converts entire image data to grayscale
		that.convertImage2grayscale = function(width, height, imageBitmapDataArray){
			var imageData = [];
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					var pixel = imageBitmapDataArray[x][y];
					var grayValue = Math.ceil( (pixel[0] + pixel[1] + pixel[2]) / 3  );
					
					pixel[0] = grayValue;
					pixel[1] = grayValue;
					pixel[2] = grayValue;
					imageData[x][y] = pixel;
				}
			}
			return imageData;
		};
		
		
		//converts entire image data to grayscale
		that.invertImage = function(width, height, imageBitmapDataArray){
			var imageData = [];
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					var pixel = imageBitmapDataArray[x][y];
					pixel[0] = 255 - pixel[0];
					pixel[1] = 255 - pixel[1];
					pixel[2] = 255 - pixel[2];
					imageData[x][y] = pixel;
				}
			}
			return imageData;
		};
		
		
		//renders each individual pixel to a passed canvas image context
		that.renderPixel = function(x, y, colorArr, imageContext){
			colorCustom = 'rgb(' + colorArr[0] + ',' + colorArr[1] + ',' + colorArr[2] + ')';
			imageContext.fillStyle = colorCustom;
			imageContext.fillRect(x, y, 1, 1);
		};
		
		
		that.combineImageData = function(width, height, imageBitmapDataArray1, imageBitmapDataArray2){
			var imageData = [];
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					var pixel1 = imageBitmapDataArray1[x][y];
					var pixel2 = imageBitmapDataArray2[x][y];
					var combinedPixel = [];
					combinedPixel[0] = pixel1[0] + pixel2[0];
					combinedPixel[1] = pixel1[1] + pixel2[1];
					combinedPixel[2] = pixel1[2] + pixel2[2];
					imageData[x][y] = combinedPixel;
				}
			}
			return imageData;
		};
		
		
		//renders the image onto a canvas element
		that.renderImage = function(width, height, imageBitmapDataArray, targetContext){
			if(imageBitmapDataArray == []){
				//image data is empty...don't do anything.
			}else{
				for(var y = 0; y < height; y++){
					for(x = 0; x < width; x++){
						try{
							var pixel = imageBitmapDataArray[x][y];
							var color = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')';
							targetContext.fillStyle = color;
				    		targetContext.fillRect(x, y, 1, 1);
						}catch(e){
							//do nothing...pixel data was bad
						}
					}
				}
			}
		};
		
		
		//Sobel gradient magnitude function to approximate gradient magnitude
		that.getGradientAngleAndDirection = function(width, height, imageBitmapDataArray){
			var imageData = [];
			var matrixSize = 3;
			
			var SobelGx =[
			  [-1,0,1],
			  [-2,0,2],
			  [-1,0,1]];
		
			var SobelGy =[
			  [ 1, 2, 1],
			  [ 0, 0, 0],
			  [-1,-2,-1]];
			  
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = []; 
				if(that.angleDirection[y] == undefined) that.angleDirection[y] = [];
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					if(that.angleDirection[x] == undefined) that.angleDirection[x] = [];
					var cord = {};
					var pixelVal = [0,0,0];
					var pixel = imageBitmapDataArray[x][y];
					var sumX = 0;
					var sumY = 0;
					var sum = 0;
					
					for(i=0; i<matrixSize; i++){
						for(j=0; j<matrixSize; j++){
							cord.y = y + i - 1;
							cord.x = x + j - 1;
								
							try{
								var tempPixel = imageBitmapDataArray[cord.x][cord.y];
								
								if(tempPixel != undefined){
									var grayValue = tempPixel[0];
									sumX += SobelGx[j][i] * grayValue;
									sumY += SobelGy[j][i] * grayValue;
								}	
							}catch(error){
								//do nothing for now....
							}
						}
					}
					
					//calculate edge gradient sum values
					sum = Math.abs(sumX) + Math.abs(sumY);
					if(sum > 255) sum = 255;
					if(sum < 0) sum = 0;
					
					pixelVal[0] = sum;
					pixelVal[1] = sum;
					pixelVal[2] = sum;
					
					//calculate edge direction values
					if(sumX != 0){
						var angleTheta = Math.atan(sumY / sumX) / 3.14159 * 180;
					
						if( (angleTheta < 22.5) && (angleTheta > -22.5)) angleTheta = 0;
						if( (angleTheta > 157.5) && (angleTheta < -157.5)) angleTheta = 0;
						
						if( (angleTheta > 22.5) && (angleTheta < 67.5)) angleTheta = 45;
						if( (angleTheta < -112.5) && (angleTheta > -157.5)) angleTheta = 45;
						
						if( (angleTheta > 67.5) && (angleTheta < 112.5)) angleTheta = 90;
						if( (angleTheta < -67.5) && (angleTheta > -112.5)) angleTheta = 90;
						
						if( (angleTheta > 112.5) && (angleTheta < 157.5)) angleTheta = 135;
						if( (angleTheta < -22.5) && (angleTheta > -67.5)) angleTheta = 135;
					}else{
						angleTheta = 0;
					}
					
					
					imageData[x][y] = pixelVal;
					that.angleDirection[x][y] = angleTheta;
				}
			}
			
			return imageData;
		};
		
		
		//this method removes teh fuzzy edges of the edges and 
		//leaves behind only the approximated true edges
		that.setNonMaximumSuppression = function(width, height, imageBitmapDataArray, upperThreshold, lowerThreshold){
			var imageData = [];
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					var color = [];
					if(imageData[x] == undefined) imageData[x] = [];
					var pixel = imageBitmapDataArray[x][y];
					var direction = that.angleDirection[x][y];
					var tan1pixel = [0,0,0];
					var tan2pixel = [0,0,0];
					
					if(direction == 135){
						try{
							tan1pixel = imageBitmapDataArray[x+1][y+1];
							tan2pixel = imageBitmapDataArray[x-1][y-1];
						}catch(e){
						}
					}
					if(direction == 90){
						try{
							tan1pixel = imageBitmapDataArray[x-1][y];
							tan2pixel = imageBitmapDataArray[x+1][y];
						}catch(e){
						}
					}	
					if(direction == 45){
						try{
							tan1pixel = imageBitmapDataArray[x-1][y+1];
							tan2pixel = imageBitmapDataArray[x+1][y-1];
						}catch(e){
						}
					}
					if(direction == 0){
						try{
							tan1pixel = imageBitmapDataArray[x][y+1];
							tan2pixel = imageBitmapDataArray[x][y-1];
						}catch(e){
						}
					}	
					
					if(tan1pixel == 'undefined' || typeof tan1pixel == 'undefined') tan1pixel = [0,0,0];
					if(tan2pixel == 'undefined' || typeof tan2pixel == 'undefined') tan2pixel = [0,0,0];
					
					//run the threshold comparison logic to see if it's a edge pixel
					if(tan1pixel[0] >= pixel[0] || tan2pixel[0] >= pixel[0]){
						pixel[0] = 0;
						pixel[1] = 0;
						pixel[2] = 0;
					}else{
						//now that we know it's an edge pixel,
						//we fine tune the edge depending if it is a strong or weak edge
						if(pixel[0] > (upperThreshold*255)){
							pixel[0] = 255;
							pixel[1] = 255;
							pixel[2] = 255;
						}else if(pixel[0] > (lowerThreshold*255)){
							pixel[0] = 128;
							pixel[1] = 128;
							pixel[2] = 128;
						}else{
							pixel[0] = 0;
							pixel[1] = 0;
							pixel[2] = 0;
						}
					}
						
					imageData[x][y] = pixel;
				}
			}

			return imageData;
		}
		
		
		//hysteresis method to remove any edges not attached to strong edges
		that.setEdgeHysteresis = function(width, height, imageBitmapDataArray){
			var imageData = [];
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					
					var pixel = imageBitmapDataArray[x][y];
					
					
				}
			}
			
			return imageData;
		}
		
		
		//convolution transformation method to change image data and apply effect
		that.matrixTransform = function(effectName, intensity, width, height, imageBitmapDataArray, customKernel){
			var imageData = [];
			var kernel = null;
			var matrixSize = null;
			var filterBias = 0;
			
			var blurKernel = [
			  [1,1,0],
			  [1,1,1],
			  [0,1,1]];
			
			var sharpenKernel = [
			  [ 0,-1, 0],
			  [-1, 5,-1],
			  [ 0,-1, 0]];	
			  
			var edgeKernel = [
			  [-1,-1,-1],
			  [-1, 8,-1],
			  [-1,-1,-1]];
			
			  
			switch(effectName){
				case 'blur':
					kernel = blurKernel;
					break;
				case 'sharpen':
					kernel = sharpenKernel;
					break;
				case 'edgeDetect':
					kernel = edgeKernel;
					break;
				case 'custom':
					kernel = customKernel;
					break;
				default:
					alert("Invalid Transformation Matrix Selected");
					return;
			}
			
			
			//get the size of the kernel element for the transform loop before
			matrixSize = kernel.length;
			
			//determin the filter bias for the kernels...
			for(var k = 0; k < matrixSize; k++){
				for(var l = 0; l < matrixSize; l++){
					filterBias += kernel[k][l];
				}
			}
			
			//check for a 0-based filter bias and offset with neutral 1 if exists
			if(filterBias == 0){
				filterBias = 1;
			}
			
			//apply intensity to the image based on intensity paramter
			if(intensity == 'undefined' || intensity == undefined){
				intensity = 1;
			}
			
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					
					var cord = {};
					var pixelVal = [0,0,0];
					
					for(i=0; i<matrixSize; i++){
						cord.y = y + i - 1;
						
						for(j=0; j<matrixSize; j++){
							cord.x = x + j - 1;
							
							try{
								var tempPixel = imageBitmapDataArray[cord.x][cord.y];
								
								if(tempPixel != undefined){
									var r = tempPixel[0] / filterBias;
									var g = tempPixel[1] / filterBias;
									var b = tempPixel[2] / filterBias;
									
									pixelVal[0] += kernel[j][i] * r * intensity;
									pixelVal[1] += kernel[j][i] * g * intensity;
									pixelVal[2] += kernel[j][i] * b * intensity;  
								}
							}catch(error){
								//nothing for now...
							}
						}
					}
					
					pixelVal[0] = Math.ceil(pixelVal[0]);
					pixelVal[1] = Math.ceil(pixelVal[1]);
					pixelVal[2] = Math.ceil(pixelVal[2]);
					
					imageData[x][y] = pixelVal;
				}
			}
			
			return imageData;
		};
		
		
		return that; //this returns an instance of the method class
	}
	
	$ED = new _ED();	
})();

