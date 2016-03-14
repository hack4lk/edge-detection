(function(){
	$ED = null;
	var _ED = function(){
		var that = {};
		
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
		
		
		//renders the image onto a canvas element
		that.renderImage = function(width, height, imageBitmapDataArray, targetContext){
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					var pixel = imageBitmapDataArray[x][y];
					var color = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')';
					targetContext.fillStyle = color;
		    		targetContext.fillRect(x, y, 1, 1);
				}
			}
		};
		
		
		//convolution transformation method to changes image data
		that.matrixTransform = function(effectName, intensity, width, height, imageBitmapDataArray, customKernel){
			var imageData = [];
			var kernel = null;
			var blurKernel = [
			  [1,1,1],
			  [1,1,1],
			  [1,1,1]];
			
			var edgeKernel = [
			  [0,0,0],
			  [-9,9,0],
			  [0,0,0]];
			
			var edge2Kernel = [
			  [0,9,0],
			  [9,-36,9],
			  [0,9,0]];
			
			var sharpenKernel =[
			  [0,-1,0],
			  [-1,13,-1],
			  [0,-1,0]];	
			
			var outlineKernel = [
			  [6,6,6],
			  [4,-36,6],
			  [6,6,6]];
			  
			  
			switch(effectName){
				case 'blur':
					kernel = blurKernel;
					break;
				case 'edgeHightlight':
					kernel = edgeKernel;
					break;
				case 'edgeDetect':
					kernel = edge2Kernel;
					break;
				case 'sharpen':
					kernel = sharpenKernel;
					break;
				case 'outline':
					kernel = outlineKernel;
					break;
				case 'custom':
					kernel = customKernel;
					break;
				default:
					alert("Invalid Transformation Matrix Selected");
					return;
			}
			
			if(intensity == 'undefined' || intensity == undefined){
				intensity = 1;
			}
			
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					
					//check to make sure that the pixel exists, otherwise do not use it
					//we're using a 3x3 matrix so only 9 cycles for each pixel
					var cord = {};
					var pixelVal = [0,0,0];
					for(i=0; i<3; i++){
						cord.y = y + i -1;
						
						for(j=0; j<3; j++){
							cord.x = x + j - 1;
							
							try{
								var tempPixel = imageBitmapDataArray[cord.x][cord.y];
								
								if(tempPixel != undefined){
									var r = tempPixel[0];
									var g = tempPixel[1];
									var b = tempPixel[2];
									
									pixelVal[0] += kernel[j][i] * r * intensity;
									pixelVal[1] += kernel[j][i] * g * intensity;
									pixelVal[2] += kernel[j][i] * b * intensity;  
								}
							}catch(error){
								//nothing for now...
							}
						}
					}
					
					pixelVal[0] = Math.ceil(pixelVal[0]/9);
					pixelVal[1] = Math.ceil(pixelVal[1]/9);
					pixelVal[2] = Math.ceil(pixelVal[2]/9);
					
					imageData[x][y] = pixelVal;
				}
			}
			
			return imageData;
		};
		
		
		return that; //this returns an instance of the method class
	}
	
	$ED = new _ED();	
})();

