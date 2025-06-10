import Moveable from 'react-moveable';
import { useRef, useState } from 'react';
import './css/draggableBox.css';

export default function DraggableBox({ zIndex, onClick }) {
  const targetRef = useRef();
  const containerRef = useRef();
  const [elementImage, setImage] = useState(null);
  const [elementText, setText] = useState('');
  const [parts, setParts] = useState([]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')){
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div
        className="draggableBox"
        ref={containerRef}
      >
        <div className="boxButtons">
          <div className="editButton">...</div>
          <div className="closeButton">x</div>
        </div>
        <img draggable={true} className={elementImage ? 'uploadedImage' : 'hidden'} src={elementImage} />
        <label className="imageUploadInput">
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }} //hides the ugly import file default button setup
          />
        </label>
        <textarea
          placeholder="Write Here!"
          value={elementText}
          onChange={(e) => setText(e.target.value)}
          className="textInput"
        />
      </div>
      

      <Moveable
        target={containerRef}
        draggable={true}
        resizable={true}
        dragTarget={containerRef}
        onClick={(e) => {
          const tagName = e.inputEvent.target.tagName.toLowerCase();
          if (['textarea', 'input', 'select', 'button', 'label'].includes(tagName)) {
            e.inputEvent.target.focus();
          }
          console.log(e.inputEvent.target, e.target)
        }}
        onDrag={({left, top }) => {
          const container = containerRef.current;
          container.style.left = `${left}px`;
          container.style.top = `${top}px`;
        }}
        onResize={({ width, height, drag }) => {
          const container = containerRef.current;
          container.style.width = `${width}px`;
          container.style.height = `${height}px`;
          container.style.left = `${drag.beforeTranslate[0]}px`;
          container.style.top = `${drag.beforeTranslate[1]}px`;
        }}
      />
    </>
  );
}
