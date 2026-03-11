import Moveable from 'react-moveable';
import { useRef, useState } from 'react';
import './css/draggableBox.css';

export default function DraggableBox({ zIndex, onClick }) {
  const containerRef = useRef();
  const [parts, setParts] = useState([{image: null}, {isText: true, text:"wazzaaap"}, {isText: true, text:"yo cuh"}, {isText: true, text:""}]);
  const [active, setActive] = useState(true);
  function handleImageUpload(index, e){
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')){
      const reader = new FileReader();
      reader.onload = (event) => {
        setParts(parts.map((item, ind) => ind === index ? {image: event.target.result} : item));
      };
      reader.readAsDataURL(file);
    }
  };

  function changeText(index, value){
    setParts(parts.map((item, ind) => ind === index ? {isText: true, text: value} : item));
  }
  function closeSheet(){
    setActive(false);
    console.log(active);
  }

  return (
    <>
      {active && <div
        className="draggableBox"
        ref={containerRef}
      >
        <div className="boxButtons">
          <div className="editButton">...</div>
          <div className="closeButton" onClick={()=>closeSheet()}>x</div>
        </div>
        {
          parts.map((elem, ind)=>{
            if(elem.isText){
              return(
                <textarea
                  key={ind}
                  placeholder="Write Here!"
                  value={elem.text}
                  onChange={(e) => changeText(ind, e.target.value)}
                  className="textInput"
                />
              );
            }else{
              return(
                <label className={elem.image && "imageLabel"}>
                  {!elem.image && <div className="imageUploadInput">Upload Image</div>}
                  {elem.image && <img draggable={true} className='uploadedImage' src={elem.image} />}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e)=>handleImageUpload(ind, e)}
                    style={{ display: 'none' }} //hides the ugly import file default button setup
                  />
                </label>
              );
            }
          })
        }
      </div>}
      

      {active && <Moveable
        target={containerRef}
        container={null}
        origin={true}
        edge={false}

        draggable={true}
        throttleDrag={0}
        onDragStart={(e) => {
          const tagName = e.inputEvent.target.tagName.toLowerCase();
          const className = e.inputEvent.target.className.toLowerCase();
          e.inputEvent.target.focus();
          console.log(tagName, className)
        }}
        onDrag={({target, left, top, transform, clientX, clientY}) => {
          target.style.left = `${left}px`;
          target.style.top = `${top}px`;
        }}

        resizable={true}
        throttleResize={0}
        onResize={({ target, width, height, direction, delta}) => {
          delta[0] && (target.style.width = `${width}px`);
          delta[1] && (target.style.height = `${height}px`);

          const [xDir, yDir] = direction;
          let [tx, ty] = (target.style.transform.match(/-?\d+\.?\d*/g) || []).map(Number);

          if (xDir === -1) tx -= delta[0];
          if (yDir === -1) ty -= delta[1];

          target.style.transform = `translate(${tx}px, ${ty}px)`;

        }}
      />}

    </>
  );
}
