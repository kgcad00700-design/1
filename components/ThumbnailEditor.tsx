
import React, { useState, useRef, useEffect } from 'react';
import { ThumbnailConfig, Layer } from '../types.ts';
import { DEFAULT_THUMBNAIL } from '../constants.ts';

const ThumbnailEditor: React.FC = () => {
  const [config, setConfig] = useState<ThumbnailConfig>(DEFAULT_THUMBNAIL);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(config.layers[0]?.id || null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showGuideLines, setShowGuideLines] = useState({ x: false, y: false });
  // 다운로드 확인 모달 관련 상태
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState('');
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const propertyFileInputRef = useRef<HTMLInputElement>(null);

  // 해상도를 1280x720으로 수정
  const canvasWidth = config.aspectRatio === '16:9' ? 1280 : 720;
  const canvasHeight = config.aspectRatio === '16:9' ? 720 : 1280;

  useEffect(() => {
    drawThumbnail();
  }, [config, canvasWidth, canvasHeight, showGuideLines, selectedLayerId]);

  const drawThumbnail = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (config.useGradient) {
      const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
      grad.addColorStop(0, config.backgroundColor);
      grad.addColorStop(1, config.gradientColor2 || '#000000');
      ctx.fillStyle = grad;
    } else {
      ctx.fillStyle = config.backgroundColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (config.backgroundImage) {
      const img = new Image();
      // 외부 이미지 오염 방지
      if (config.backgroundImage.startsWith('http')) {
        img.crossOrigin = "anonymous";
      }
      img.src = config.backgroundImage;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = `rgba(0,0,0,${config.overlayOpacity})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        renderLayers(ctx);
        renderGuides(ctx);
        renderSelectionHighlight(ctx);
      };
      img.onerror = () => {
        renderLayers(ctx);
        renderGuides(ctx);
        renderSelectionHighlight(ctx);
      };
    } else {
      renderLayers(ctx);
      renderGuides(ctx);
      renderSelectionHighlight(ctx);
    }
  };

  const hexToRgba = (hex: string, opacity: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const renderLayers = (ctx: CanvasRenderingContext2D) => {
    config.layers.forEach(layer => {
      if (!layer.visible) return;
      
      if (layer.type === 'text') {
        if (layer.useBackground) {
          ctx.fillStyle = hexToRgba(layer.bgColor || '#000000', layer.bgOpacity ?? 0.6);
          const boxHeight = layer.fontSize * 1.4;
          ctx.fillRect(0, layer.y - boxHeight / 2, canvasWidth, boxHeight);
        }

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = layer.color;
        ctx.font = `${layer.fontWeight === 'bold' ? 'bold ' : ''}${layer.fontSize}px Pretendard, sans-serif`;
        ctx.fillText(layer.content, layer.x, layer.y);
      } else if (layer.type === 'image') {
        const img = new Image();
        // 이미지 소스가 외부 URL인 경우 캔버스 오염 방지
        if (layer.content.startsWith('http')) {
          img.crossOrigin = "anonymous";
        }
        img.src = layer.content;
        if (img.complete) {
          const width = layer.fontSize * 2;
          const height = layer.imageAspectRatio ? (width / layer.imageAspectRatio) : width;
          ctx.drawImage(img, layer.x - width / 2, layer.y - height / 2, width, height);
        } else {
          img.onload = () => drawThumbnail();
        }
      }
    });
  };

  const renderGuides = (ctx: CanvasRenderingContext2D) => {
    if (!isDragging) return;
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;

    if (showGuideLines.x) {
      ctx.beginPath();
      ctx.moveTo(canvasWidth / 2, 0);
      ctx.lineTo(canvasWidth / 2, canvasHeight);
      ctx.stroke();
    }
    if (showGuideLines.y) {
      ctx.beginPath();
      ctx.moveTo(0, canvasHeight / 2);
      ctx.lineTo(canvasWidth, canvasHeight / 2);
      ctx.stroke();
    }
    ctx.restore();
  };

  const renderSelectionHighlight = (ctx: CanvasRenderingContext2D) => {
    if (!selectedLayerId) return;
    const layer = config.layers.find(l => l.id === selectedLayerId);
    if (!layer || !layer.visible) return;

    ctx.save();
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    
    if (layer.type === 'text') {
      ctx.font = `${layer.fontWeight === 'bold' ? 'bold ' : ''}${layer.fontSize}px Pretendard, sans-serif`;
      const textMetrics = ctx.measureText(layer.content);
      const padding = 15;
      const width = textMetrics.width + padding * 2;
      const height = layer.fontSize + padding;
      ctx.strokeRect(layer.x - width / 2, layer.y - height / 2, width, height);
    } else {
      const width = layer.fontSize * 2;
      const height = layer.imageAspectRatio ? (width / layer.imageAspectRatio) : width;
      ctx.strokeRect(layer.x - width / 2, layer.y - height / 2, width, height);
    }
    ctx.restore();
  };

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCoordinates(e);
    if (!coords) return;

    const { x: mouseX, y: mouseY } = coords;
    const reversedLayers = [...config.layers].reverse();
    const foundLayer = reversedLayers.find(layer => {
      if (!layer.visible) return false;
      if (layer.type === 'text') {
        const boxHeight = layer.fontSize * 1.4;
        return layer.useBackground 
          ? (mouseY >= layer.y - boxHeight / 2 && mouseY <= layer.y + boxHeight / 2)
          : (Math.abs(mouseX - layer.x) < 200 && Math.abs(mouseY - layer.y) < layer.fontSize / 2);
      } else {
        const width = layer.fontSize;
        const height = layer.imageAspectRatio ? (width / layer.imageAspectRatio) : width;
        return Math.abs(mouseX - layer.x) < width && Math.abs(mouseY - layer.y) < height;
      }
    });

    if (foundLayer) {
      if (e.cancelable) e.preventDefault();
      setSelectedLayerId(foundLayer.id);
      setIsDragging(true);
      setDragOffset({ x: mouseX - foundLayer.x, y: mouseY - foundLayer.y });
    } else {
      setSelectedLayerId(null);
    }
  };

  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedLayerId) return;
    const coords = getCoordinates(e);
    if (!coords) return;

    if (e.cancelable) e.preventDefault();

    const { x: mouseX, y: mouseY } = coords;
    let newX = Math.round(mouseX - dragOffset.x);
    let newY = Math.round(mouseY - dragOffset.y);
    const threshold = 15;
    const isNearCenterX = Math.abs(newX - canvasWidth / 2) < threshold;
    const isNearCenterY = Math.abs(newY - canvasHeight / 2) < threshold;
    setShowGuideLines({ x: isNearCenterX, y: isNearCenterY });
    if (isNearCenterX) newX = canvasWidth / 2;
    if (isNearCenterY) newY = canvasHeight / 2;

    // 레이어 간 스냅 기능은 이제 updateLayer에서 "항상 붙어있게" 처리하므로 
    // 여기서는 별도의 스냅 로직 없이 가이드라인만 표시합니다.
    
    updateLayer(selectedLayerId, { x: newX, y: newY });
  };

  const handleEnd = () => {
    setIsDragging(false);
    setShowGuideLines({ x: false, y: false });
  };

  const applyStacking = (layers: Layer[], triggerId: string): Layer[] => {
    let newLayers = [...layers];
    const bgLayers = newLayers.filter(l => l.type === 'text' && l.useBackground && l.visible);
    
    if (bgLayers.length < 2) return newLayers;

    // Y축 기준으로 정렬하여 수직 순서를 파악
    const sortedBgLayers = [...bgLayers].sort((a, b) => a.y - b.y);
    const triggerIndex = sortedBgLayers.findIndex(l => l.id === triggerId);

    if (triggerIndex === -1) return newLayers;

    // 아래쪽 레이어들 조정
    for (let i = triggerIndex + 1; i < sortedBgLayers.length; i++) {
      const prevLayer = sortedBgLayers[i - 1];
      const currLayer = sortedBgLayers[i];
      const prevBottom = prevLayer.y + (prevLayer.fontSize * 1.4 / 2);
      const newY = prevBottom + (currLayer.fontSize * 1.4 / 2);
      
      newLayers = newLayers.map(l => l.id === currLayer.id ? { ...l, y: newY } : l);
      sortedBgLayers[i] = { ...newLayers.find(l => l.id === currLayer.id) as Layer };
    }

    // 위쪽 레이어들 조정
    for (let i = triggerIndex - 1; i >= 0; i--) {
      const nextLayer = sortedBgLayers[i + 1];
      const currLayer = sortedBgLayers[i];
      const nextTop = nextLayer.y - (nextLayer.fontSize * 1.4 / 2);
      const newY = nextTop - (currLayer.fontSize * 1.4 / 2);
      
      newLayers = newLayers.map(l => l.id === currLayer.id ? { ...l, y: newY } : l);
      sortedBgLayers[i] = { ...newLayers.find(l => l.id === currLayer.id) as Layer };
    }

    return newLayers;
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setConfig(prev => {
      let newLayers = prev.layers.map(l => l.id === id ? { ...l, ...updates } : l);

      // '운스튜디오3' 레이어의 글자 크기 변경 시 하위 레이어 크기 자동 조절
      if (id === 'layer-1' && 'fontSize' in updates) {
        const l1 = newLayers.find(l => l.id === 'layer-1');
        if (l1) {
          const newL2FontSize = Math.round(l1.fontSize * 0.7);
          newLayers = newLayers.map(l => l.id === 'layer-2' ? { ...l, fontSize: newL2FontSize } : l);
        }
      }

      // 자석처럼 붙는 스택 로직 적용
      return { ...prev, layers: applyStacking(newLayers, id) };
    });
  };

  const handlePanelLayerClick = (layerId: string) => {
    // 기본적으로 레이어를 보이게 하고 선택 상태로 만듭니다.
    updateLayer(layerId, { visible: true });
    setSelectedLayerId(layerId);

    // '운스튜디오3' 레이어 (id: 'layer-1')가 선택될 때 자동으로 중앙에 배치하는 로직을 제거했습니다.
    // 이제 레이어를 클릭해도 위치는 현재 위치를 유지합니다.
  };

  const insertLayerAtStandardPosition = (newLayer: Layer) => {
    setConfig(prev => {
      let newLayers;
      if (newLayer.type === 'image') {
        // 이미지는 글씨 레이어보다 아래에 위치하도록 배열의 맨 앞에 삽입합니다.
        newLayers = [newLayer, ...prev.layers];
      } else {
        // 텍스트 레이어는 가장 위에 위치하도록 배열의 맨 뒤에 삽입합니다.
        newLayers = [...prev.layers, newLayer];
      }

      // 새 레이어가 배경을 사용한다면 스택에 포함시킵니다.
      if (newLayer.type === 'text' && newLayer.useBackground) {
        newLayers = applyStacking(newLayers, newLayer.id);
      }

      return { ...prev, layers: newLayers };
    });
    setSelectedLayerId(newLayer.id);
  };

  const addTextLayer = () => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      type: 'text',
      content: '새 텍스트',
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      fontSize: 50,
      color: '#ffffff',
      visible: true,
      fontWeight: 'normal',
      useBackground: true,
      bgColor: '#000000',
      bgOpacity: 0.6
    };
    insertLayerAtStandardPosition(newLayer);
    setShowAddMenu(false);
  };

  const processFile = (file: File, fillScreen: boolean = false) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          // 이미지 비율 계산
          const ratio = img.width / img.height;
          
          // 이미지 크기를 화면에 맞게 계산
          let scale;
          if (fillScreen) {
            // 화면을 꽉 채우는 크기
            scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
          } else {
            // 화면 안에 적절히 들어오는 크기 (80% 수준)
            scale = Math.min(canvasWidth / img.width, canvasHeight / img.height) * 0.8;
          }
          
          const finalFontSize = (img.width * scale) / 2;
          const newLayer: Layer = {
            id: `layer-${Date.now() + Math.random()}`,
            type: 'image',
            content: img.src,
            x: canvasWidth / 2,
            y: canvasHeight / 2,
            fontSize: finalFontSize,
            color: '#ffffff',
            visible: true,
            fontWeight: 'normal',
            imageAspectRatio: ratio
          };
          insertLayerAtStandardPosition(newLayer);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImageLayer = (e: React.ChangeEvent<HTMLInputElement>, fillScreen: boolean = false) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => processFile(file as File, fillScreen));
      setShowAddMenu(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent, fillScreen: boolean = false) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => processFile(file as File, fillScreen));
    }
  };

  const changeAspectRatio = (newRatio: '16:9' | '9:16') => {
    if (config.aspectRatio === newRatio) return;
    // 이전 기준값 (1280x720)
    const oldW = config.aspectRatio === '16:9' ? 1280 : 720;
    const oldH = config.aspectRatio === '16:9' ? 720 : 1280;
    const newW = newRatio === '16:9' ? 1280 : 720;
    const newH = newRatio === '16:9' ? 720 : 1280;
    setConfig(prev => ({
      ...prev,
      aspectRatio: newRatio,
      layers: prev.layers.map(layer => ({
        ...layer,
        x: Math.round((layer.x / oldW) * newW),
        y: Math.round((layer.y / oldH) * newH),
      }))
    }));
  };

  const deleteLayer = (id: string) => {
    setConfig(prev => ({ ...prev, layers: prev.layers.filter(l => l.id !== id) }));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    const index = config.layers.findIndex(l => l.id === id);
    if (index < 0) return;
    const newLayers = [...config.layers];
    const targetIndex = direction === 'up' ? index + 1 : index - 1;
    if (targetIndex >= 0 && targetIndex < newLayers.length) {
      [newLayers[index], newLayers[targetIndex]] = [newLayers[targetIndex], newLayers[index]];
      setConfig(prev => ({ ...prev, layers: newLayers }));
    }
  };

  /**
   * 모바일 및 데스크톱 환경 모두에서 가장 안정적으로 이미지를 "저장"하도록 개선된 함수
   */
  const downloadImage = (filename: string) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setShowDownloadConfirm(false);
      return;
    }
    
    // 파일 이름 정리
    const finalFilename = (filename || `thumbnail-${Math.floor(Date.now() / 1000)}`).trim();
    const fileNameWithExtension = finalFilename.endsWith('.png') ? finalFilename : `${finalFilename}.png`;

    try {
      // 모바일 브라우저(특히 인앱 브라우저나 구형 기기)에서 Blob URL보다 DataURL이 
      // 다운로드 트리거를 더 확실하게 인식하는 경우가 많으므로 DataURL 방식을 우선 사용합니다.
      const dataUrl = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileNameWithExtension;
      
      // iOS 및 일부 모바일 브라우저 호환성을 위해 target _blank 및 rel 설정
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // 반드시 DOM에 추가해야 일부 브라우저에서 click 이벤트가 정상 작동함
      document.body.appendChild(link);
      
      // 지연 없이 즉시 클릭 실행 (사용자 제스처 유효성 유지)
      link.click();
      
      // 브라우저가 처리를 완료할 시간을 준 후 정리
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        setShowDownloadConfirm(false);
      }, 1000);
    } catch (err) {
      console.error("Save failed:", err);
      // DataURL 실패 시 Blob 방식으로 폴백 시도
      canvas.toBlob((blob) => {
        if (!blob) {
          alert("이미지 데이터를 생성할 수 없습니다.");
          setShowDownloadConfirm(false);
          return;
        }
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileNameWithExtension;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          setShowDownloadConfirm(false);
        }, 2000);
      }, 'image/png');
    }
  };

  // "디자인 내보내기" 버튼 클릭 시 핸들러
  const handleExportButtonClick = () => {
    const timestamp = Math.floor(Date.now() / 1000);
    // 초기 파일 이름 설정
    setDownloadFileName(`thumbnail-${timestamp}`);
    setShowDownloadConfirm(true);
  };

  const selectedLayer = config.layers.find(l => l.id === selectedLayerId);
  const sortedLayersForList = [...config.layers].reverse().sort((a, b) => {
    if (a.content === '운스튜디오3') return -1;
    if (b.content === '운스튜디오3') return 1;
    return 0;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-fadeIn">
      {/* 캔버스 영역 */}
      <div className="flex-1 flex flex-col items-center sticky xl:relative top-[73px] xl:top-0 z-40 bg-black pb-4">
        <div className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded-xl shadow-2xl overflow-hidden relative">
          <div className="flex justify-center items-center w-full overflow-auto max-h-[40vh] md:max-h-[80vh]">
            <canvas 
              ref={canvasRef} 
              width={canvasWidth} 
              height={canvasHeight} 
              onMouseDown={handleStart}
              onMouseMove={handleMove}
              onMouseUp={handleEnd}
              onMouseLeave={handleEnd}
              onTouchStart={handleStart}
              onTouchMove={handleMove}
              onTouchEnd={handleEnd}
              className={`max-w-full h-auto rounded-lg shadow-inner bg-zinc-800 ${isDragging ? 'cursor-grabbing' : 'cursor-crosshair'}`}
              style={{ 
                aspectRatio: config.aspectRatio === '16:9' ? '1280 / 720' : '720 / 1280',
                touchAction: 'none'
              }}
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3 w-full">
          <button onClick={handleExportButtonClick} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-all text-sm md:text-base">
            디자인 내보내기 (PNG)
          </button>
        </div>
      </div>

      <div className="w-full xl:w-96 flex flex-col gap-6 pb-20 xl:pb-0">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden relative">
          <div className="bg-zinc-800/50 px-4 py-3 border-b border-zinc-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-300">레이어 패널</h3>
            <div className="relative">
              <button onClick={() => setShowAddMenu(!showAddMenu)} className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded transition-colors">+ 추가</button>
              {showAddMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10 overflow-hidden">
                  <button onClick={addTextLayer} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-700 transition-colors border-b border-zinc-700">텍스트 추가</button>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full text-left px-4 py-2 text-xs hover:bg-zinc-700 transition-colors">이미지 추가</button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleAddImageLayer(e, false)} />
                </div>
              )}
            </div>
          </div>
          <div className="max-h-[550px] overflow-y-auto p-2 space-y-1">
            {sortedLayersForList.map(layer => (
              <div 
                key={layer.id} 
                onClick={() => handlePanelLayerClick(layer.id)} 
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${selectedLayerId === layer.id ? 'bg-purple-600/20 border border-purple-600/50' : 'bg-black/20 border border-transparent hover:bg-zinc-800'}`}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); updateLayer(layer.id, { visible: !layer.visible }); }} 
                  className={`text-lg transition-opacity ${layer.visible ? 'text-zinc-300' : 'text-zinc-700 opacity-40'}`}
                >
                  {layer.visible ? '👁️' : '🕶️'}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate text-white">{layer.type === 'text' ? layer.content : '이미지 레이어'}</p>
                  <p className="text-[10px] text-zinc-500 uppercase">{layer.type}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'up'); }} className="text-xs bg-zinc-800 p-1 rounded hover:bg-zinc-700 text-zinc-400">↑</button>
                  <button onClick={(e) => { e.stopPropagation(); moveLayer(layer.id, 'down'); }} className="text-xs bg-zinc-800 p-1 rounded hover:bg-zinc-700 text-zinc-400">↓</button>
                  <button onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }} className="text-xs bg-red-900/20 text-red-500/60 p-1 rounded hover:bg-red-900/40 hover:text-red-500">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-purple-400 border-b border-zinc-800 pb-2 mb-4">속성 편집</h3>
          {selectedLayer ? (
            <div className="space-y-4">
              {selectedLayer.type === 'text' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">텍스트 내용</label>
                    <input type="text" value={selectedLayer.content} onChange={e => updateLayer(selectedLayer.id, { content: e.target.value })} className="w-full bg-black border border-zinc-700 rounded-lg p-2 text-sm focus:border-purple-500 outline-none" />
                  </div>
                  <div className="p-3 bg-black/40 border border-zinc-800 rounded-xl space-y-3">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="useBackground" checked={selectedLayer.useBackground} onChange={e => updateLayer(selectedLayer.id, { useBackground: e.target.checked })} className="w-4 h-4 rounded border-zinc-700 bg-black text-purple-600 focus:ring-purple-500" />
                      <label htmlFor="useBackground" className="text-xs font-bold text-zinc-300">배경 박스 사용</label>
                    </div>
                    {selectedLayer.useBackground && (
                      <div className="grid grid-cols-2 gap-3 pl-6">
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">박스 색상</label>
                          <input type="color" value={selectedLayer.bgColor || '#000000'} onChange={e => updateLayer(selectedLayer.id, { bgColor: e.target.value })} className="w-full h-7 bg-black border border-zinc-700 rounded p-1" />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">투명도 ({(selectedLayer.bgOpacity ?? 0.6) * 100}%)</label>
                          <input type="range" min="0" max="1" step="0.1" value={selectedLayer.bgOpacity ?? 0.6} onChange={e => updateLayer(selectedLayer.id, { bgOpacity: parseFloat(e.target.value) })} className="w-full accent-purple-500" />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">크기</label>
                <div className="flex items-center gap-3">
                  <input type="range" min="0" max="3000" value={selectedLayer.fontSize} onChange={e => updateLayer(selectedLayer.id, { fontSize: parseInt(e.target.value) || 0 })} className="flex-1 accent-purple-500" />
                  <input 
                    type="number" 
                    value={selectedLayer.fontSize === 0 ? '' : selectedLayer.fontSize} 
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                      updateLayer(selectedLayer.id, { fontSize: isNaN(val) ? 0 : val });
                    }} 
                    placeholder="0"
                    className="w-20 bg-black border border-zinc-700 rounded p-1 text-center text-xs outline-none focus:border-purple-500" 
                  />
                </div>
              </div>

              {/* 방향 전환 */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">방향 전환</label>
                <div className="flex gap-2">
                  <button 
                    onClick={() => changeAspectRatio('16:9')} 
                    className={`flex-1 py-2 rounded text-[10px] font-bold transition-all ${config.aspectRatio === '16:9' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                  >
                    가로방향
                  </button>
                  <button 
                    onClick={() => changeAspectRatio('9:16')} 
                    className={`flex-1 py-2 rounded text-[10px] font-bold transition-all ${config.aspectRatio === '9:16' ? 'bg-purple-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                  >
                    세로방향
                  </button>
                </div>
              </div>

              {selectedLayer.type === 'text' && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">글자색</label>
                  <input type="color" value={selectedLayer.color} onChange={e => updateLayer(selectedLayer.id, { color: e.target.value })} className="w-full h-8 bg-black border border-zinc-700 rounded p-1" />
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-zinc-600 text-sm">편집할 레이어를 선택하세요.</div>
          )}
          <div className="mt-6 border-t border-zinc-800 pt-6">
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase mb-3">이미지 첨부 (화면에 꽉 차게)</h4>
            <div onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, true)} onClick={() => propertyFileInputRef.current?.click()} className="border-2 border-dashed border-zinc-800 hover:border-purple-600 bg-zinc-950 rounded-xl p-6 text-center transition-all cursor-pointer group">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">🖼️</div>
              <p className="text-[10px] text-zinc-500 font-medium">드래그하거나 클릭하여<br/>이미지를 화면 가득 채우기</p>
              <input type="file" ref={propertyFileInputRef} className="hidden" accept="image/*" multiple onChange={(e) => handleAddImageLayer(e, true)} />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-zinc-400 mb-4">전체 설정</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-2">화면 비율</label>
              <div className="flex gap-2">
                <button onClick={() => changeAspectRatio('16:9')} className={`flex-1 py-2 rounded text-xs font-bold transition-all ${config.aspectRatio === '16:9' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>가로형</button>
                <button onClick={() => changeAspectRatio('9:16')} className={`flex-1 py-2 rounded text-xs font-bold transition-all ${config.aspectRatio === '9:16' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>세로형</button>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <input type="checkbox" id="useGradient" checked={config.useGradient} onChange={e => setConfig(prev => ({ ...prev, useGradient: e.target.checked }))} className="w-4 h-4 rounded border-zinc-700 bg-black text-purple-600 focus:ring-purple-500" />
                <label htmlFor="useGradient" className="text-xs font-bold text-zinc-300">배경 그라데이션 사용</label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <input type="color" value={config.backgroundColor} onChange={e => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))} className="w-full h-8 bg-black border border-zinc-700 rounded p-1" />
                </div>
                {config.useGradient && (
                  <div>
                    <input type="color" value={config.gradientColor2 || '#000000'} onChange={e => setConfig(prev => ({ ...prev, gradientColor2: e.target.value }))} className="w-full h-8 bg-black border border-zinc-700 rounded p-1" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 다운로드 확인 모달 */}
      {showDownloadConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] px-4">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center animate-fadeIn">
            <h3 className="text-2xl font-black mb-2 text-white italic">Download</h3>
            <p className="text-zinc-500 text-xs mb-6 font-medium">저장할 파일 이름을 입력해 주세요.</p>
            
            <div className="mb-8">
              <div className="flex items-center bg-black border border-zinc-800 rounded-lg overflow-hidden focus-within:border-purple-600 transition-colors">
                <input 
                  type="text" 
                  value={downloadFileName} 
                  onChange={(e) => setDownloadFileName(e.target.value)}
                  placeholder="파일 이름 입력"
                  className="w-full bg-transparent px-4 py-3 text-sm text-white outline-none"
                  autoFocus
                />
                <span className="bg-zinc-800 px-3 py-3 text-[10px] font-bold text-zinc-500 border-l border-zinc-800">.PNG</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowDownloadConfirm(false)} 
                className="flex-1 px-6 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-bold hover:bg-zinc-700 transition-all text-sm"
              >
                취소
              </button>
              <button 
                onClick={() => downloadImage(downloadFileName)} 
                className="flex-1 px-6 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-600/20 transition-all text-sm"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailEditor;