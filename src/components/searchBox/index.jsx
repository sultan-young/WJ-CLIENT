import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dropdown, Space } from "antd";
import { DownOutlined } from "@ant-design/icons";
import "./styles.css"; // 创建对应的CSS文件

const SearchBox = ({ onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [defaultItem, setDefaultItem] = useState(0);

  const handleSubmit = (e) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    // performSearch();
    const data = {
      type: defaultItem,
      content: searchTerm.trim(),
    };
    onSearch(data);
    e.preventDefault();
  };

  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);
  const idleTimerRef = useRef();
  const debounceTimerRef = useRef();

  // 执行搜索逻辑
  const performSearch = useCallback(() => {
    const data = {
      type: defaultItem,
      content: searchTerm.trim(),
    };
    onSearch(data);
  }, [searchTerm, onSearch]);

  // 自动聚焦逻辑
  const autoFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // 重置无操作定时器
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(autoFocus, 10000); // 10秒无操作后聚焦
  }, [autoFocus]);

  // 防抖搜索
  // useEffect(() => {
  //   debounceTimerRef.current = setTimeout(performSearch, 1000);
  //   return () => {
  //     if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
  //   };
  // }, [searchTerm, performSearch]);

  // 初始化和事件监听
  useEffect(() => {
    // 初始聚焦
    autoFocus();

    // 添加活动检测事件
    const events = ["mousemove", "keydown", "touchstart"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer);
    });

    return () => {
      // 清理事件监听和定时器
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [autoFocus, resetIdleTimer]);

  // 处理键盘事件

  const items = [
    {
      label: "模糊查询",
      key: 0,
    },
    {
      label: "tag查询",
      key: 1,
    },
  ];
  return (
    <form
      className={`search-box-container ${isFocused ? "focused" : ""}`}
      onSubmit={handleSubmit}
    >
      <div className="search-input-wrapper">
        <Dropdown
          menu={{
            items,
            selectable: true,
            defaultSelectedKeys: defaultItem,
            onClick: (e) => {
              console.log(e.key, "查询type");
              setDefaultItem(e?.key);
            },
          }}
          trigger={["click"]}
        >
          <Space>
            <span
              style={{ color: "#1677ff", fontSize: "14px", marginLeft: "14px" }}
            >
              {items?.find((a) => a.key == defaultItem)?.label}
            </span>
            <DownOutlined style={{ color: "#1677ff" }} />
          </Space>
        </Dropdown>
        <input
          type="text"
          autoFocus
          value={searchTerm}
          ref={inputRef}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="可通过SKU, 供应商名称，商品名称等进行模糊搜索"
          className="search-input"
          aria-label="Search"
        />
        <button type="submit" className="search-button">
          <svg
            className="search-icon"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBox;
