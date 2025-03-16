import React from "react";
import { Image } from "antd";
import styles from "./index.module.less";
import empty from "./empty.svg";

const ImageGallery = ({ images, height = "100%" }) => {
  if (!images || images.length === 0) return null;

  // 计算宫格参数
  const getGridParams = () => {
    const count = images.length;
    if (count === 1) return { columns: 1, gridSize: 1 };
    if (count > 4) return { columns: 3, gridSize: 9 };
    return { columns: 2, gridSize: 4 };
  };

  const { columns, gridSize } = getGridParams();

  return (
    <div style={{overflow: 'hidden', height: '100%'}}>
      <Image.PreviewGroup>
        {columns === 1 ? (
          <Image src={images[0]} style={{ maxWidth: "100%", height }} />
        ) : (
          <div
            style={{
              display: "grid",
              gap: 8,
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              height,
            }}
          >
            {Array.from({ length: gridSize }).map((_, index) => {
              return (
                <div
                  key={index}
                  style={{
                    position: "relative",
                    backgroundColor: "#f0f0f0",
                    width: "100%",
                    display: "flex",
                  }}
                >
                  <Image
                    src={images[index] || empty}
                    style={{
                      position: "absolute",
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
