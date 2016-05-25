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
			//var allImageData = new Uint32Array(ctx.getImageData(0,0,width,height).data.buffer);
			//var imageData = new Uint32Array(width * height);
			var imageData = [];
			var allImageData = imageContext.getImageData(0,0, width, height);
			var counter = 0;
			
			allImageData = allImageData.data;
			
			for(var y = 0; y < height; y++){
				if(imageData[y] == undefined) imageData[y] = [];
				
				for(x = 0; x < width; x++){
					if(imageData[x] == undefined) imageData[x] = [];
					var pixel = [
					   allImageData[4 * counter + 0],
					   allImageData[4 * counter + 1],
					   allImageData[4 * counter + 2],
					   allImageData[4 * counter + 3],
					   ];
					
					if(convertToGrayscale === true){
						var grayValue = that.convertPixel2grayscale(pixel);
						pixel[0] = grayValue;
						pixel[1] = grayValue;
						pixel[2] = grayValue;
					}
					
					imageData[x][y] = pixel;
					counter++;
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
		that.renderImage = function(width, height, imageBitmapData, targetContext){
		    if(Array.isArray(imageBitmapData)){
		        if(imageBitmapData == []){
                    //image data is empty...don't do anything.
                }else{
                    for(var y = 0; y < height; y++){
                        for(x = 0; x < width; x++){
                            
                            if(typeof imageBitmapData[x][y] == 'undefined'){
                                var color = 'rgb(0,0,0)';
                            }else{
                                var pixel = imageBitmapData[x][y];
                                var color = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')';
                            }
                            targetContext.fillStyle = color;
                            targetContext.fillRect(x, y, 1, 1);
                        }
                    }
                }
		    }else{
		        for(var y = 0; y < height; y++){
                    for(x = 0; x < width; x++){
                        
                        if(typeof imageBitmapData[x+","+y] == 'undefined'){
                            var color = 'rgb(0,0,0)';
                        }else{
                            var pixel = imageBitmapData[x+","+y];
                            var color = 'rgb(' + pixel[0] + ',' + pixel[1] + ',' + pixel[2] + ')';
                        }
                        targetContext.fillStyle = color;
                        targetContext.fillRect(x, y, 1, 1);
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
							
							if(typeof imageBitmapDataArray[cord.x] != 'undefined' && typeof imageBitmapDataArray[cord.x][cord.y] != 'undefined'){
							    var tempPixel = imageBitmapDataArray[cord.x][cord.y];
							    var grayValue = tempPixel[0];
                                sumX += SobelGx[j][i] * grayValue;
                                sumY += SobelGy[j][i] * grayValue;
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
			var imageData = {};
			var hasCounter = 0;
			var hasBlank = 0;
			for(var y = 0; y < height; y++){
				for(x = 0; x < width; x++){
					var color = [];
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
					
					if(pixel[0] != 0){
					    imageData[x+","+y] = pixel;
					}
				}
			}
			
			return imageData;
		}
		
		//simple function to remove weak edges
		that.removeWeakEdges = function(width, height, imageBitmapDataArray){
		    for(var y = 0; y < height; y++){
		        for(var x = 0; x < width; x++){
		            if(typeof imageBitmapDataArray[x][y] != 'undefined'){
		               var pixel = imageBitmapDataArray[x][y];
                        if(pixel[0] == 128){
                            imageBitmapDataArray[x][y] = [0,0,0,255];
                        } 
		            }
		        }
		    }
		};
		
		//hysteresis 8-point connection method to remove any weak edges not attached to strong edges
		that.setEdgeHysteresis = function(imageBitmapData, returnBlobsOnly){
			var that = {};
			var imageData = [];
			that.blobs = [];
			that.markedPixels = {};
			that.analizedPixels = [];
            that.blob = [];
            that.validPoints = [];
            that.tempC = 0;
            that.limit = 2;
            that.recursiveCounter = 0;
            
			var findBlobs = function(){
			    for(item in imageBitmapData){
			        
		            var pixel = item;
                
                    if(typeof that.markedPixels[pixel] != 'undefined' && that.markedPixels[pixel].marked == true){
                        //do nothing....pixel is already marked.
                    }else{
                        that.blob = [];
                        that.recursiveCounter = 0;
                        //that.analizedPixels = [];
                        that.markedPixels[pixel] = {marked: true};
                        
                        //add seed pixel to blob
                        that.blob.push([pixel, imageBitmapData[pixel]]);
                        
                        //do a forward pass....
                        DFS(pixel);

                        that.blobs.push(that.blob);
                    }
			    }
			    
			};
			
			
			//helper function to find nearest neighbor
			var DFS = function(posRef){
				
				//loop through all the neigbor pixels to detect any connected neighbors
				//spit reference into x and y coords
				var currRef = posRef;
				posRef = posRef.split(",");
				//console.log(posRef);
				
				that.recursiveCounter++;
				//console.log(that.recursiveCounter);
				
                for(var nY = -1; nY < 2; nY++){
                    for(var nX = 1; nX > -2; nX--){
                        var offsetX = parseInt(posRef[0]) + nX;
                        var offsetY = parseInt(posRef[1]) + nY;
                        var np = undefined;
                        
                        if(currRef != (offsetX+","+offsetY)){
                            np = imageBitmapData[offsetX+","+offsetY];    
                        }
                        
                        //only mark the pixel if it's not the seed/center pixel and it's not already maked
                        if(typeof np != 'undefined' && typeof that.markedPixels[offsetX+","+offsetY] == 'undefined'){
                            //console.log(currRef + " -- " + offsetX+ "," + offsetY);
                            that.markedPixels[offsetX+","+offsetY] = {marked: true};
                            
                            //add pixel to blob
                            that.blob.push([offsetX+","+offsetY, np]);
                            DFS(offsetX+","+offsetY);
                            break;
                        }
                    }
                }//end outer for loop...
			};
		
		
		    //----------first we find all the blobs-----------//
			findBlobs();
			
			//-----next we remove any blogs that do not meet our requirements-----//
			var limit = that.blobs.length;
            var pointer = 0;
            
            while(pointer < limit){
                var blob = that.blobs[pointer];
                var strong = false;
                
                for(var j=0; j<blob.length; j++){
                    if(blob[j][1][0] == 255){
                        strong = true;
                        break;
                    }
                }
                
                if(!strong || blob.length == 1){
                    that.blobs.splice(pointer, 1);
                    limit--;
                }else{
                    pointer++;
                }
                
            }
			
			
			if(returnBlobsOnly){
			    return that.blobs;
			}else{
			    
                //now, we now wipe and return the new bitmapData as an object instead of array...
                imageBitmapData = {};
                
                for(var i=0; i< that.blobs.length; i++){
                    var blob = that.blobs[i];
                    
                    for(var j=0; j<blob.length; j++){
                         imageBitmapData[blob[j][0]] = [255,255,255,255];
                    }
                }
			    
			    return imageBitmapData;
			}
			
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
                                
                            if(typeof imageBitmapDataArray[cord.x] != 'undefined' && typeof imageBitmapDataArray[cord.x][cord.y] != 'undefined'){
                                var tempPixel = imageBitmapDataArray[cord.x][cord.y];
                                var r = tempPixel[0] / filterBias;
                                var g = tempPixel[1] / filterBias;
                                var b = tempPixel[2] / filterBias;
                                
                                pixelVal[0] += kernel[j][i] * r * intensity;
                                pixelVal[1] += kernel[j][i] * g * intensity;
                                pixelVal[2] += kernel[j][i] * b * intensity;  
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
		
		that.getCannyEdges = function(width, height, context, blobsOnly){
		    var imageData = null;
            imageData = that.getPixelData(width, height, context, true); 
            imageData = that.matrixTransform('blur', 1, width, height, imageData);
            imageData = that.getGradientAngleAndDirection(width, height, imageData);
            imageData = that.setNonMaximumSuppression(width, height, imageData, 0.8, 0.4);
            
            if(blobsOnly){
                 return $ED.setEdgeHysteresis(imageData, true);
            }else{
                 return $ED.setEdgeHysteresis(imageData);
            }
        }
		
		return that; //this returns an instance of the method class
	}
	
	
	$ED = new _ED();	
})();

