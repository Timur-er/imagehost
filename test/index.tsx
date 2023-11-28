import React, { useState, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'

import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from '../src'
import { canvasPreview } from './canvasPreview'
import { useDebounceEffect } from './useDebounceEffect'
import axios from 'axios'

import { getAllUsers } from './services/requests'

import '../src/ReactCrop.scss'
import { debug } from 'webpack'
import { FALSE } from 'sass'

// This is to demonstate how to make and center a % aspect crop
// which is a bit trickier so we use some helper functions.
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  console.log(mediaHeight, mediaWidth)
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 100,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  )
}

export default function App() {
  const listRef = useRef(null)
  const previewCanvaslist = useRef(null)
  /*const listNode = listRef.current*/

  const [originalWidth, setOriginalWidth] = useState(0.0)
  const [originalHeigth, setOriginalHeight] = useState(0.0)

  const [imgSrc, setImgSrc] = useState('')
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef1x1 = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef4x3 = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef16x9 = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef2x1 = useRef<HTMLCanvasElement>(null)
  const previewCanvasRef3x2 = useRef<HTMLCanvasElement>(null)

  const imgRef = useRef<HTMLImageElement>(null)
  const imgRef1x1 = useRef<HTMLImageElement>(null)
  const imgRef4x3 = useRef<HTMLImageElement>(null)
  const imgRef16x9 = useRef<HTMLImageElement>(null)
  const imgRef2x1 = useRef<HTMLImageElement>(null)
  const imgRef3x2 = useRef<HTMLImageElement>(null)


  const [crop, setCrop] = useState<Crop>()
  const [crop1x1, setCrop1x1] = useState<Crop>()
  const [crop4x3, setCrop4x3] = useState<Crop>()
  const [crop16x9, setCrop16x9] = useState<Crop>()
  const [crop2x1, setCrop2x1] = useState<Crop>()
  const [crop3x2, setCrop3x2] = useState<Crop>()

  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [completedCrop1x1, setCompletedCrop1x1] = useState<PixelCrop>()
  const [completedCrop4x3, setCompletedCrop4x3] = useState<PixelCrop>()
  const [completedCrop16x9, setCompletedCrop16x9] = useState<PixelCrop>()
  const [completedCrop2x1, setCompletedCrop2x1] = useState<PixelCrop>()
  const [completedCrop3x2, setCompletedCrop3x2] = useState<PixelCrop>()

  const [scale, setScale] = useState(1)
  const [rotate, setRotate] = useState(0)

  const [aspect, setAspect] = useState<number | undefined>(16 / 9)
  const [aspect1x1, setAspect1x1] = useState<number>(1/1)
  const [aspect4x3, setAspect4x3] = useState<number>(4/3)
  const [aspect16x9, setAspect16x9] = useState<number>(16/9)
  const [aspect2x1, setAspect2x1] = useState<number>(2/1)
  const [aspect3x2, setAspect3x2] = useState<number>(3/2)

  const [posts, setPosts] = useState([]);

  const [image, setImage] = useState<File>()
  const reader = new FileReader();

  const [showPopup, setShowPopup] = useState(false);
  const [requestResult, setRequestResult] = useState('');

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      setCrop(undefined) // Makes crop preview update between images.
      const reader = new FileReader()
      setImage(e.target.files[0])
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = imageUrl;
      // wait for the image to load
      image.onload = () => {
        const width = image.width;
        const height = image.height;
        setOriginalWidth(width / 100)
        setOriginalHeight(height / 100)
        console.log('Width:', width, 'Height:', height);
      };

      reader.readAsDataURL(e.target.files[0])
      reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
    }
  }

  /*
  function onImageSave() {
    const [picture, setPicture] = useState({});
    const uploadPicture = (e) => {
      setPicture({
         contains the preview, if you want to show the picture to the user
            you can access it with this.state.currentPicture
        
        picturePreview: URL.createObjectURL(e.target.files[0]),
         this contains the file we want to send
        pictureAsFile: e.target.files[0],
      });
    };

    const setImageAction = async (event) => {
      event.preventDefault();

      const formData = new FormData();
      formData.append("file", picture.pictureAsFile);

      console.log(picture.pictureAsFile);

      for (var key of formData.entries()) {
        console.log(key[0] + ", " + key[1]);
      }

      const data = await fetch("http://localhost:3000/upload/post", {
        method: "post",
        headers: { "Content-Type": "multipart/form-data" },
        body: formData,
      });
      const uploadedImage = await data.json();
      if (uploadedImage) {
        console.log("Successfully uploaded image");
      } else {
        console.log("Error Found");
      }
    };
  }

  */

  function onImageSave() {
    if (originalWidth && originalHeigth) {
      console.log(originalWidth, originalHeigth)
      if (image) {
        const formData = new FormData();
        formData.append("image", image)
        formData.append("title", 'some new ad title')
        if (crop1x1) {
          formData.append('box1x1left_crop', String((crop1x1.x) * originalWidth))
          formData.append('box1x1top_crop', String(crop1x1.y * originalHeigth))
          formData.append('box1x1left_crop_width', String((crop1x1.width + crop1x1.x) * originalWidth))
          formData.append('box1x1top_crop_height', String((crop1x1.height + crop1x1.y) * originalHeigth))
        }
        if (crop2x1) {
          formData.append('box2x1left_crop', String((crop2x1.x) * originalWidth))
          formData.append('box2x1top_crop', String((crop2x1.y) * originalHeigth))
          formData.append('box2x1left_crop_width', String((crop2x1.width + crop2x1.x) * originalWidth))
          formData.append('box2x1top_crop_height', String((crop2x1.height + crop2x1.y) * originalHeigth))
        }

        if (crop3x2) {
          formData.append('box3x2left_crop', String((crop3x2.x) * originalWidth))
          formData.append('box3x2top_crop', String((crop3x2.y) * originalHeigth))
          formData.append('box3x2left_crop_width', String((crop3x2.width + crop3x2.x) * originalWidth))
          formData.append('box3x2top_crop_height', String((crop3x2.height + crop3x2.y) * originalHeigth))
        }
        if (crop4x3) {
          formData.append('box4x3left_crop', String((crop4x3.x) * originalWidth))
          formData.append('box4x3top_crop', String((crop4x3.y) * originalHeigth))
          formData.append('box4x3left_crop_width', String((crop4x3.width + crop4x3.x) * originalWidth))
          formData.append('box4x3top_crop_height', String((crop4x3.height + crop4x3.y) * originalHeigth))
        }

        if (crop16x9) {
          formData.append('box16x9left_crop', String((crop16x9.x) * originalWidth))
          formData.append('box16x9top_crop', String((crop16x9.y) * originalHeigth))
          formData.append('box16x9left_crop_width', String((crop16x9.width + crop16x9.x) * originalWidth))
          formData.append('box16x9top_crop_height', String((crop16x9.height + crop16x9.y) * originalHeigth))
        }

        
        /*
        axios.post('https://httpbin.org/post', {
            formData: formData,
            withCredentials: false,
          }, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        */
          //http://localhost:8000/upload
        axios.post('https://img.tdevsdsp.org/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          //'Access-Control-Allow-Origin': '*',
        }
        })
        .then(response => {
          setRequestResult('Ok')
        })
        .catch(error => {
          setRequestResult(error)
        })
        showPopupWindow()
      }
    }
  }

  function showPopupWindow () {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    setShowPopup(true);
    /*
    setTimeout(() => {
      setShowPopup(false);
      window.location.reload();
    }, 5000);
    */
  };

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    if (aspect) {
      const { width, height } = e.currentTarget
      setCrop(centerAspectCrop(width, height, aspect))
    }

    const { width, height } = e.currentTarget
    setCrop1x1(centerAspectCrop(width, height, aspect1x1))
    setCrop2x1(centerAspectCrop(width, height, aspect2x1))
    setCrop3x2(centerAspectCrop(width, height, aspect3x2))
    setCrop4x3(centerAspectCrop(width, height, aspect4x3))
    setCrop16x9(centerAspectCrop(width, height, aspect16x9))
  }

  /*
  function onImageSave() {
    const imgNode = document.querySelector("input[type=file]")
    if (imgNode) {

      const file = imgNode.files[0];
    }


    if (!picture.pictureAsFile) {
      return
    }
    const formData = new FormData();
    formData.append("file", picture.pictureAsFile);
    for (var key of formData.entries()) {
      console.log(key[0] + ", " + key[1]);
    }

    const data = await fetch("http://localhost:3000/upload/post", {
      method: "post",
      headers: { "Content-Type": "multipart/form-data" },
      body: formData,
    });
    const uploadedImage = await data.json();
    if (uploadedImage) {
      console.log("Successfully uploaded image");
    } else {
      console.log("Error Found");
    }




    fetch(`http://img.tdevsdsp.org:8081/list`, {
      method: 'GET',
      headers: {'Content-Type': 'application/json'},
    })
    
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
   })
   .catch((err) => {
      console.log(err.message);
   });
    fetch('')
    .then((res) => res.json())
    .then((data) => {
       console.log(data);
       setPosts(data);
    })
    .catch((err) => {
       console.log(err.message);
    });

  }
  */

  useDebounceEffect(
    async () => {
      /*
      const listNode = listRef.current
      /*
      const imgNode = listNode.querySelectorAll('li > div > img')[0]
      */
      if (completedCrop1x1?.width && completedCrop1x1?.height && imgRef1x1.current && previewCanvasRef1x1.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef1x1.current, previewCanvasRef1x1.current, completedCrop1x1, scale, rotate)
      }
    },
    100,
    [completedCrop1x1, scale, rotate]
  )
  useDebounceEffect(
    async () => {
      /*
      const listNode = listRef.current
      /*
      const imgNode = listNode.querySelectorAll('li > div > img')[0]
      */
      if (completedCrop4x3?.width && completedCrop4x3?.height && imgRef4x3.current && previewCanvasRef4x3.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef4x3.current, previewCanvasRef4x3.current, completedCrop4x3, scale, rotate)
      }
    },
    100,
    [completedCrop4x3, scale, rotate]
  )
  useDebounceEffect(
    async () => {
      /*
      const listNode = listRef.current
      /*
      const imgNode = listNode.querySelectorAll('li > div > img')[0]
      */
      if (completedCrop3x2?.width && completedCrop3x2?.height && imgRef3x2.current && previewCanvasRef3x2.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef3x2.current, previewCanvasRef3x2.current, completedCrop3x2, scale, rotate)
      }
    },
    100,
    [completedCrop3x2, scale, rotate]
  )

  useDebounceEffect(
    async () => {
      /*
      const listNode = listRef.current
      /*
      const imgNode = listNode.querySelectorAll('li > div > img')[0]
      */
      if (completedCrop16x9?.width && completedCrop16x9?.height && imgRef16x9.current && previewCanvasRef16x9.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef16x9.current, previewCanvasRef16x9.current, completedCrop16x9, scale, rotate)
      }
    },
    100,
    [completedCrop16x9, scale, rotate]
  )

  useDebounceEffect(
    async () => {
      /*
      const listNode = listRef.current
      /*
      const imgNode = listNode.querySelectorAll('li > div > img')[0]
      */
      if (completedCrop2x1?.width && completedCrop2x1?.height && imgRef2x1.current && previewCanvasRef2x1.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef2x1.current, previewCanvasRef2x1.current, completedCrop2x1, scale, rotate)
      }
    },
    100,
    [completedCrop2x1, scale, rotate]
  )


 
  /*
  useDebounceEffect(
    async () => {
      /*
      const listNode = listRef.current
      /*
      const imgNode = listNode.querySelectorAll('li > div > img')[0]
      
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate)
      }
    },
    100,
    [completedCrop, scale, rotate]
  )

  useDebounceEffect(
    async () => {
      /*
      const listNode = listRef.current
      /*
      const imgNode = listNode.querySelectorAll('li > div > img')[0]
      
      if (completedCrop?.width && completedCrop?.height && imgRef.current && previewCanvasRef.current) {
        // We use canvasPreview as it's much faster than imgPreview.
        canvasPreview(imgRef.current, previewCanvasRef.current, completedCrop, scale, rotate)
      }
    },
    100,
    [completedCrop, scale, rotate]
  )
  */



  function handleToggleAspectClick() {
    setAspect1x1(1)
    setAspect2x1(2)
    setAspect3x2(1.5)
    setAspect4x3(4/3)
    setAspect16x9(16/9)
    
    if (imgRef1x1.current) {
      const { width, height } = imgRef1x1.current
      setCrop1x1(centerAspectCrop(width, height, aspect1x1))
    }
    if (imgRef2x1.current) {
      const { width, height } = imgRef2x1.current
      setCrop2x1(centerAspectCrop(width, height, aspect2x1))
    }
    if (imgRef3x2.current) {
      const { width, height } = imgRef3x2.current
      setCrop3x2(centerAspectCrop(width, height, aspect3x2))
    }
    if (imgRef4x3.current) {
      const { width, height } = imgRef4x3.current
      setCrop4x3(centerAspectCrop(width, height, aspect4x3))
    }
    if (imgRef16x9.current) {
      const { width, height } = imgRef16x9.current
      setCrop16x9(centerAspectCrop(width, height, aspect16x9))
    }
  }

  return (
    <div className="App">
      <div>
        {showPopup && (
          <div className="popup">
            <p>{requestResult}</p>
          </div>
        )}
        <div className="box-wrapper">
          <div className="box">
          <label htmlFor="scale-input">Scale: </label>
          <input
            id="scale-input"
            type="number"
            step="0.1"
            value={scale}
            disabled={!imgSrc}
            onChange={e => setScale(Number(e.target.value))}
          />
          </div>
          <div className="box">
          <label htmlFor="rotate-input">Rotate: </label>
          <input
            id="rotate-input"
            type="number"
            value={rotate}
            disabled={!imgSrc}
            onChange={e => setRotate(Math.min(180, Math.max(-180, Number(e.target.value))))}
          />
          </div>
          <div className="box">
            <input type="file" accept="image/*" onChange={onSelectFile} />
          </div>
        </div>
     </div>
        <div className="box-wrapper">
            <div className="box frame-container">
                <div className="image-container frame">
                    {!!imgSrc && (
                        <ReactCrop
                        crop={crop1x1}
                        onChange={(_, percentCrop) => setCrop1x1(percentCrop)}
                        onComplete={c => setCompletedCrop1x1(c)}
                        aspect={aspect1x1}
                        >
                        <img
                            
                            ref={imgRef1x1}
                            alt="Crop me"
                            src={imgSrc}
                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                            onLoad={onImageLoad}
                        />
                        </ReactCrop>
                    )}
                </div>
                <div className="canvas-container frame">
                  {!!completedCrop1x1 && (
                    <canvas
                      ref={previewCanvasRef1x1}
                      style={{
                        border: '1px solid black',
                        objectFit: 'contain',
                        width: '360px',
                        height: '360px',
                      }}
                    />
                  )}
                </div>
            </div>
        </div>
        <div className="box-wrapper">
            <div className="box">
                <div className="image-container frame">
                    {!!imgSrc && (
                        <ReactCrop
                        crop={crop4x3}
                        onChange={(_, percentCrop) => setCrop4x3(percentCrop)}
                        onComplete={c => setCompletedCrop4x3(c)}
                        aspect={aspect4x3}
                        >
                        <img
                            ref={imgRef4x3}
                            alt="Crop me"
                            src={imgSrc}
                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                            onLoad={onImageLoad}
                        />
                        </ReactCrop>
                    )}
                </div>
                <div className="canvas-container frame">
                  {!!completedCrop4x3 && (
                    <canvas
                      ref={previewCanvasRef4x3}
                      style={{
                        border: '1px solid black',
                        objectFit: 'contain',
                        width: '440px',
                        height: '330px',
                      }}
                    />
                  )}
                </div>
            </div>
        </div>
        <div className="box-wrapper">
            <div className="box">
                <div className="image-container frame">
                    {!!imgSrc && (
                        <ReactCrop
                        crop={crop16x9}
                        onChange={(_, percentCrop) => setCrop16x9(percentCrop)}
                        onComplete={c => setCompletedCrop16x9(c)}
                        aspect={aspect16x9}
                        >
                        <img
                            ref={imgRef16x9}
                            alt="Crop me"
                            src={imgSrc}
                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                            onLoad={onImageLoad}
                        />
                        </ReactCrop>
                    )}
                </div>
                <div className="canvas-container frame">
                  {!!completedCrop16x9 && (
                    <canvas
                      ref={previewCanvasRef16x9}
                      style={{
                        border: '1px solid black',
                        objectFit: 'contain',
                        width: '480px',
                        height: '270px',
                      }}
                    />
                  )}
                </div>
            </div>
        </div>
        <div className="box-wrapper">
            <div className="box">
                <div className="image-container frame">
                    {!!imgSrc && (
                        <ReactCrop
                        crop={crop2x1}
                        onChange={(_, percentCrop) => setCrop2x1(percentCrop)}
                        onComplete={c => setCompletedCrop2x1(c)}
                        aspect={aspect2x1}
                        >
                        <img
                            ref={imgRef2x1}
                            alt="Crop me"
                            src={imgSrc}
                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                            onLoad={onImageLoad}
                        />
                        </ReactCrop>
                    )}
                </div>
                <div className="canvas-container frame">
                  {!!completedCrop2x1 && (
                    <canvas
                      ref={previewCanvasRef2x1}
                      style={{
                        border: '1px solid black',
                        objectFit: 'contain',
                        width: '400px',
                        height: '200px',
                      }}
                    />
                  )}
                </div>
            </div>
        </div>
        <div className="box-wrapper">
            <div className="box">
                <div className="image-container frame">
                    {!!imgSrc && (
                        <ReactCrop
                        crop={crop3x2}
                        onChange={(_, percentCrop) => setCrop3x2(percentCrop)}
                        onComplete={c => setCompletedCrop3x2(c)}
                        aspect={aspect3x2}
                        >
                        <img
                            ref={imgRef3x2}
                            alt="Crop me"
                            src={imgSrc}
                            style={{ transform: `scale(${scale}) rotate(${rotate}deg)` }}
                            onLoad={onImageLoad}
                        />
                        </ReactCrop>
                    )}
                </div>
                <div className="canvas-container frame">
                  {!!completedCrop3x2 && (
                    <canvas
                      ref={previewCanvasRef3x2}
                      style={{
                        border: '1px solid black',
                        objectFit: 'contain',
                        width: '300px',
                        height: '200px',
                      }}
                    />
                  )}
                </div>
            </div>
        </div>
        <div className="box-wrapper">
          <div className="box">
            <button 
              className="save-button frame"
              onClick={onImageSave}
            >Save</button>
          </div>
        </div>
      </div>
  )
}

const root = createRoot(document.getElementById('root')!)
root.render(<App />)