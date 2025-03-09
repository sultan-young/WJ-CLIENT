import { createContext, useContext, useEffect, useState } from "react";
import { getSuppliers } from "../services/supplierService";
import React from "react";

// 创建Context对象
const PreloadDataContext = createContext({
  suppliers: [],
  loading: true,
  error: null,
  refreshData: () => {},
});

// 创建自定义Hook
export const usePreloadData = () => useContext(PreloadDataContext);

// 创建Provider组件
export const PreloadDataProvider = ({ children }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialLoad, setInitialLoad] = useState(false);

  // 数据获取函数
  const fetchData = async () => {
    // 获取供应商列表
    const suppliers = await getSuppliers();
    setSuppliers(suppliers);
  };

  // 首次加载数据
  useEffect(() => {
    if (!initialLoad) {
      fetchData();
      setInitialLoad(true);
    }
  }, [initialLoad]);

  // 手动刷新数据
  const refreshData = () => {
    setLoading(true);
    fetchData();
  };

  return (
    <PreloadDataContext.Provider value={{ suppliers }}>
      {children}
    </PreloadDataContext.Provider>
  );
};
