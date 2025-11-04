#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import json
import os
import sys

def main():
    # 配置文件路径
    config_file = os.path.join("..", "build", "wechatgame", "project.config.json")
    
    print(f"目标文件: {config_file}")
    print(f"文件是否存在: {os.path.exists(config_file)}")
    
    # 检查文件是否存在
    if not os.path.exists(config_file):
        print("错误: 配置文件不存在")
        input("按回车键退出...")
        return False
    
    try:
        # 读取JSON文件
        with open(config_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 获取当前版本
        old_version = data.get('libVersion', '未找到')
        print(f"当前版本: {old_version}")
        
        # 修改版本号
        data['libVersion'] = '3.8.11'
        
        # 写回文件
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f"成功: {old_version} -> 3.8.11")
        return True
        
    except Exception as e:
        print(f"错误: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        print("\n执行失败，请检查以上错误信息")
    input("\n按回车键退出...")