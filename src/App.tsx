  import React, { useRef, useEffect, useState } from 'react';
  import exampleImage from './assets/image3.png';
  import { Button } from './components/ui/button';
  import quotes from './data/quotes.json';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState('image3.png');
  const [textPosition, setTextPosition] = useState({ x: 0.5, y: 0.2 }); // Normalized position (0-1)
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [emoji, setEmoji] = useState((quotes as any).emoji || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const emojiOptions = [
    '😀','😁','😂','🤣','😊','😍','😘','😎','😇','🙂','🙃','😉','😌','🤩','🥳','🤗',
    '🤔','🤨','😐','😴','😪','🥱','😴','😮','😲','😳','🥺','😭','😤','😡','🤯','💀',
    '🙏','👌','👍','👎','👏','🙌','💪','🤝','✌️','👋','🤟','🫶','💖','💘','💝','💯'
  ];
  
  // State for quote lines
  const [quoteLines, setQuoteLines] = useState({
    line1: (quotes as any).quoteLine1,
    line2: (quotes as any).quoteLine2,
    line3: (quotes as any).quoteLine3,
    line4: (quotes as any).quoteLine4,
    line5: (quotes as any).quoteLine5,
    line6: (quotes as any).quoteLine6,
    line7: (quotes as any).quoteLine7,
    line8: (quotes as any).quoteLine8
  });
  
  const [webmUrlBrowser, setWebmUrlBrowser] = useState<string | null>(null);

  // Dynamically load all images from assets folder
  const [backgroundImages, setBackgroundImages] = useState<Array<{name: string, src: string}>>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  // Pagination for background images
  const [imagePage, setImagePage] = useState(0);
  const pageSize = 10;

  // Function to dynamically import all images from assets folder
  const loadAssetsImages = async () => {
    try {
      // Get all image files from assets folder
      const imageModules = import.meta.glob('/src/assets/*.{png,jpg,jpeg,gif,webp}', { eager: true });
      
      const images = Object.entries(imageModules).map(([path, module]) => {
        const fileName = path.split('/').pop() || '';
        return {
          name: fileName,
          src: (module as any).default || path
        };
      });
      
      setBackgroundImages(images);
      setImagesLoaded(true);
    } catch (error) {
      console.error('Error loading assets:', error);
      // Fallback to known images
      setBackgroundImages([
        { name: 'image1.png', src: '/src/assets/image1.png' },
        { name: 'image2.png', src: '/src/assets/image2.png' },
        { name: 'image3.png', src: '/src/assets/image3.png' },
        { name: '985802477a2b5735a4aa4e11669723ce2e93b173.png', src: '/src/assets/985802477a2b5735a4aa4e11669723ce2e93b173.png' }
      ]);
      setImagesLoaded(true);
    }
  };

  // Load images on component mount
  useEffect(() => {
    loadAssetsImages();
  }, []);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (!emojiPickerRef.current) return;
      if (!emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [showEmojiPicker]);

  useEffect(() => {
    const img = imageRef.current;
    if (img && imageLoaded) {
      drawCanvas();
      drawPreviewCanvas();
    }
  }, [imageLoaded, selectedImage, textPosition, selectedFilter, quoteLines, emoji]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Apply filter
    applyFilter(ctx, canvas.width, canvas.height);

     // Add emoji at draggable position
     ctx.font = `${canvas.width * 0.06}px Arial`;
     ctx.textAlign = 'center';
     ctx.fillText(emoji, canvas.width * textPosition.x, canvas.height * textPosition.y);

     // Add all 8 lines alternating red/black at draggable position
     ctx.font = `bold ${canvas.width * 0.035}px Arial`;  //text size
     ctx.textAlign = 'center';
     // dOWNLOAD IMPACT AREA
     const lines = [
       { text: quoteLines.line1, color: '#000000' },//#dc2626 - red
       { text: quoteLines.line2, color: '#000000' },
       { text: quoteLines.line3, color: '#000000' },
       { text: quoteLines.line4, color: '#000000' },
       { text: quoteLines.line5, color: '#000000' },
       { text: quoteLines.line6, color: '#000000' },
       { text: quoteLines.line7, color: '#000000' },
       { text: quoteLines.line8, color: '#000000' }
     ];

     lines.forEach((line, index) => {
       ctx.fillStyle = line.color;
       const yPosition = textPosition.y + 0.1 + (index * 0.04); //Gap Between lines
       ctx.fillText(line.text, canvas.width * textPosition.x, canvas.height * yPosition);
     });
   };

   const drawPreviewCanvas = () => {
     const canvas = previewCanvasRef.current;
     const img = imageRef.current;
     
     if (!canvas || !img) return;

     const ctx = canvas.getContext('2d');
     if (!ctx) return;

     // Set canvas size to match image
     canvas.width = img.naturalWidth;
     canvas.height = img.naturalHeight;

    // Draw the image
    ctx.drawImage(img, 0, 0);

    // Apply filter
    applyFilter(ctx, canvas.width, canvas.height);

    // Add emoji at draggable position
     ctx.font = `${canvas.width * 0.06}px Arial`;
     ctx.textAlign = 'center';
     ctx.fillText(emoji, canvas.width * textPosition.x, canvas.height * textPosition.y);

     // Add all 8 lines alternating red/black at draggable position
     ctx.font = `bold ${canvas.width * 0.035}px Arial`;  //text size
     ctx.textAlign = 'center';
     
     const lines = [
       { text: quoteLines.line1, color: '#000000' },//#dc2626 - red
       { text: quoteLines.line2, color: '#000000' },
       { text: quoteLines.line3, color: '#000000' },
       { text: quoteLines.line4, color: '#000000' },
       { text: quoteLines.line5, color: '#000000' },
       { text: quoteLines.line6, color: '#000000' },
       { text: quoteLines.line7, color: '#000000' },
       { text: quoteLines.line8, color: '#000000' }
     ];

     lines.forEach((line, index) => {
       ctx.fillStyle = line.color;
       const yPosition = textPosition.y + 0.1 + (index * 0.04); //Gap Between lines
       ctx.fillText(line.text, canvas.width * textPosition.x, canvas.height * yPosition);
     });
   };

   const waitForImageLoaded = async () => {
     const img = imageRef.current;
     if (!img) return;
     if (imageLoaded || (img.complete && img.naturalWidth > 0)) {
       return;
     }
     await new Promise<void>((resolve) => {
       const onLoad = () => {
         img.removeEventListener('load', onLoad);
         resolve();
       };
       img.addEventListener('load', onLoad, { once: true });
     });
   };

   const applyFilter = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
     const imageData = ctx.getImageData(0, 0, width, height);
     const data = imageData.data;

     switch (selectedFilter) {
       case 'grayscale':
         for (let i = 0; i < data.length; i += 4) {
           const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
           data[i] = gray;     // Red
           data[i + 1] = gray; // Green
           data[i + 2] = gray; // Blue
         }
         break;
       
       case 'sepia':
         for (let i = 0; i < data.length; i += 4) {
           const r = data[i];
           const g = data[i + 1];
           const b = data[i + 2];
           data[i] = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
           data[i + 1] = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
           data[i + 2] = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
         }
         break;
       
       case 'vintage':
         for (let i = 0; i < data.length; i += 4) {
           data[i] = Math.min(255, data[i] * 1.2);     // Boost red
           data[i + 1] = Math.min(255, data[i + 1] * 0.9); // Reduce green
           data[i + 2] = Math.min(255, data[i + 2] * 0.8); // Reduce blue
         }
         break;
       
       case 'bright':
         for (let i = 0; i < data.length; i += 4) {
           data[i] = Math.min(255, data[i] * 1.3);
           data[i + 1] = Math.min(255, data[i + 1] * 1.3);
           data[i + 2] = Math.min(255, data[i + 2] * 1.3);
         }
         break;
       
       case 'dark':
         for (let i = 0; i < data.length; i += 4) {
           data[i] = Math.max(0, data[i] * 0.7);
           data[i + 1] = Math.max(0, data[i + 1] * 0.7);
           data[i + 2] = Math.max(0, data[i + 2] * 0.7);
         }
         break;
       
       case 'contrast':
         for (let i = 0; i < data.length; i += 4) {
           data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.5 + 128));
           data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.5 + 128));
           data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.5 + 128));
         }
         break;
       
       case 'blur':
         // Simple blur effect
         const tempData = new Uint8ClampedArray(data);
         for (let y = 1; y < height - 1; y++) {
           for (let x = 1; x < width - 1; x++) {
             const idx = (y * width + x) * 4;
             for (let c = 0; c < 3; c++) {
               let sum = 0;
               for (let dy = -1; dy <= 1; dy++) {
                 for (let dx = -1; dx <= 1; dx++) {
                   const neighborIdx = ((y + dy) * width + (x + dx)) * 4 + c;
                   sum += tempData[neighborIdx];
                 }
               }
               data[idx + c] = sum / 9;
             }
           }
         }
         break;
       
       case 'none':
       default:
         return; // No filter applied
     }

     ctx.putImageData(imageData, 0, 0);
   };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create download link
    const link = document.createElement('a');
    link.download = 'marathi-quote-image.png';
    link.href = canvas.toDataURL();
    link.click();
  };


  return (
    <div className="min-h-screen overflow-auto bg-gray-100 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto h-full flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Left column: controls */}
        <div className="w-full md:w-1/2 flex flex-col">
          {/* Background Image Selector */}
          <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-center">
            Select Background Image ({backgroundImages.length} available)
          </h3>
          {!imagesLoaded ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading images...</p>
            </div>
          ) : (
            <div className="relative">
              {/* Pagination controls */}
              <div className="flex items-center justify-between px-2 sm:px-4 mb-2">
                <button
                  className="px-3 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setImagePage((p) => Math.max(0, p - 1))}
                  disabled={imagePage === 0}
                  aria-label="Previous images"
                >
                  ← Previous
                </button>
                <div className="text-sm text-gray-600">
                  Page {Math.min(imagePage + 1, Math.max(1, Math.ceil(backgroundImages.length / pageSize)))} of {Math.max(1, Math.ceil(backgroundImages.length / pageSize))}
                </div>
                <button
                  className="px-3 py-1 text-sm border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                  onClick={() => setImagePage((p) => (p + 1 < Math.ceil(backgroundImages.length / pageSize) ? p + 1 : p))}
                  disabled={imagePage + 1 >= Math.ceil(backgroundImages.length / pageSize)}
                  aria-label="Next images"
                >
                  Next →
                </button>
              </div>

              <div className="flex gap-2 sm:gap-3 overflow-x-hidden overflow-y-hidden pb-2 px-2 sm:px-4 h-28 max-w-full sm:max-w-[920px] mx-auto">
                {backgroundImages
                  .slice(imagePage * pageSize, imagePage * pageSize + pageSize)
                  .map((image) => (
                  <div
                    key={image.name}
                    className={`flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      selectedImage === image.name 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => {
                      setSelectedImage(image.name);
                      setImageLoaded(false);
                    }}
                  >
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover"
                      onError={(e) => {
                        console.error('Failed to load image:', image.name);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <p className="text-[10px] sm:text-xs text-center p-1 bg-white truncate max-w-20" title={image.name}>
                      {image.name}
                    </p>
                  </div>
                ))}
              </div>
              
              {/* End pagination block */}
            </div>
          )}
          </div>

          {/* Download Preview and Quote Lines side-by-side */}
          <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 mb-4 sm:pl-4">
            {/* Left: Preview and Download */}
            <div className="flex flex-col items-center w-full sm:w-auto">
              <div className="relative">
                <canvas 
                  ref={previewCanvasRef}
                  className="w-full max-w-xs sm:w-64 h-auto object-contain rounded-lg shadow-lg border cursor-move"
                  style={{ display: imageLoaded ? 'block' : 'none' }}
                  onMouseDown={(e) => {
                    setIsDragging(true);
                    const rect = e.currentTarget.getBoundingClientRect();
                    const canvas = previewCanvasRef.current;
                    if (canvas) {
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      setDragStart({
                        x: (e.clientX - rect.left) * scaleX,
                        y: (e.clientY - rect.top) * scaleY
                      });
                    }
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging) return;
                    const rect = e.currentTarget.getBoundingClientRect();
                    const canvas = previewCanvasRef.current;
                    if (canvas) {
                      const scaleX = canvas.width / rect.width;
                      const scaleY = canvas.height / rect.height;
                      const newX = (e.clientX - rect.left) * scaleX;
                      const newY = (e.clientY - rect.top) * scaleY;
                      
                      setTextPosition({
                        x: Math.max(0.1, Math.min(0.9, newX / canvas.width)),
                        y: Math.max(0.05, Math.min(0.8, newY / canvas.height))
                      });
                    }
                  }}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                />
                <p className="text-center text-sm text-gray-600 mt-2">
                  Download Preview - Drag text to move
                </p>
              </div>
              <Button 
                onClick={downloadImage}
                disabled={!imageLoaded}
                className="mt-2 border border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-md transition-colors cursor-pointer px-4 py-2 rounded-none w-full sm:w-auto"
              >
                Download PNG
              </Button>
            </div>

            {/* Right: Quote Lines Editor */}
            <div className="w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-3">Edit Quote Lines (1-8)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((lineNum) => (
                  <div key={lineNum} className="flex items-center gap-2">
                    <label className="w-16 text-sm font-medium text-gray-700">
                      Line {lineNum}
                    </label>
                    <input
                      type="text"
                      value={quoteLines[`line${lineNum}` as keyof typeof quoteLines]}
                      onChange={(e) => setQuoteLines(prev => ({
                        ...prev,
                        [`line${lineNum}`]: e.target.value
                      }))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder={`Line ${lineNum}`}
                    />
                  </div>
                ))}
              </div>

              {/* Emoji Input under line 8 */}
              <div className="mt-3 relative" ref={emojiPickerRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                <input
                  type="text"
                  value={emoji}
                  onFocus={() => setShowEmojiPicker(true)}
                  onClick={() => setShowEmojiPicker(true)}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Enter emoji (e.g., 😊, 💯)"
                  maxLength={64}
                />
                {showEmojiPicker && (
                  <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                    <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
                      {emojiOptions.map((em) => (
                        <button
                          key={em}
                          type="button"
                          className="text-xl hover:bg-gray-100 rounded p-1 flex items-center justify-center"
                          onClick={() => {
                            setEmoji((prev) => `${prev}${em}`);
                          }}
                          aria-label={`Select ${em}`}
                        >
                          {em}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <button
                        type="button"
                        className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        onClick={() => setEmoji('')}
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 text-sm border border-gray-300 rounded bg-gray-100 hover:bg-gray-200"
                        onClick={() => setShowEmojiPicker(false)}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Image Filter Selector */}
          <div className="mb-4">
          <h3 className="text-lg font-semibold mb-3 text-center">Apply Image Filter</h3>
          <div className="flex justify-center">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-48"
            >
              <option value="none">🎨 None (Original)</option>
              <option value="grayscale">⚫ Grayscale</option>
              <option value="sepia">🟤 Sepia</option>
              <option value="vintage">📷 Vintage</option>
              <option value="bright">☀️ Bright</option>
              <option value="dark">🌙 Dark</option>
              <option value="contrast">⚡ Contrast</option>
              <option value="blur">🌫️ Blur</option>
            </select>
          </div>
          </div>

          

          {/* Actions */}
          <div className="grid gap-4 items-start flex-1 overflow-hidden">
            <div className="space-y-3 overflow-hidden">
              <div className="flex gap-2 flex-wrap">
                {/* Download button moved to fixed top-right */}
              </div>
            </div>
          </div>
        </div>

        {/* Right column: preview */}
        <div className="w-full md:w-1/2">
          {/* Hidden Original Image */}
          <img 
            ref={imageRef}
            src={backgroundImages.find(img => img.name === selectedImage)?.src || exampleImage}
            alt="Selected background"
            className="hidden"
            onLoad={() => setImageLoaded(true)}
          />

          

          {/* Hidden canvas for generating downloadable image */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>

      {/* Removed fixed top download to keep single button beside preview */}
    </div>
  );
}