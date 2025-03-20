import React, { useEffect, useRef } from "react";
import { Image } from "antd";
import "./index.less";
import empty from "./empty.svg";

const ImageGallery = ({ images, width = "100%" }) => {
  if (!images || images.length === 0) return 111;

  // 计算宫格参数
  const getGridParams = () => {
    const count = images.length;
    if (count === 1) return { columns: 1, gridSize: 1 };
    if (count > 4) return { columns: 3, gridSize: 9 };
    return { columns: 2, gridSize: 4 };
  };

  const { columns, gridSize } = getGridParams();

  return (
    <div className="image-gallery-container" style={{ width }}>
      <Image.PreviewGroup>
        {columns === 1 ? (
          <Image src={images[0]} style={{ maxWidth: "100%", height: '100%', objectFit: 'cover' }} />
        ) : (
          <div
            className="image-gallery-container-grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(${columns}, 1fr)`,
              height: '100%',
            }}
          >
            {Array.from({ length: gridSize }).map((_, index) => {
              return (
                <div
                  className="image-gallery-container-grid-item-wrapper"
                  key={index}
                >
                  <Image
                    src={images[index] || empty}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </Image.PreviewGroup>
    </div>
  );
};

export default ImageGallery;
