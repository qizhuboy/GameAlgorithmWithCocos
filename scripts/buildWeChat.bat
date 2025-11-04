@echo off
setlocal

set COCOS_PATH="C:\ProgramData\cocos\editors\Creator\2.4.12\CocosCreator.exe"
set PROJECT_PATH="C:\Self\GameAlgorithmWithCocos"
set CONFIG_PATH="settings\wechatgame.json"

echo 正在启动自动化构建...

REM 使用 --disable-popup 禁止弹窗
REM 使用 --logfile 记录详细日志
%COCOS_PATH% --path %PROJECT_PATH% --build "configPath=%CONFIG_PATH%" --disable-popup --logfile "auto_build.log"

if %errorlevel% equ 0 (
    echo 自动化构建成功完成!
) else (
    echo 构建失败，请查看 auto_build.log 文件
)