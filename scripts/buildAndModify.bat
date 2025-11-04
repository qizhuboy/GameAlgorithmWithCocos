@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

set "LOG_FILE=auto_build.log"

echo ================================== > "!LOG_FILE!"
echo   微信小游戏自动化构建和配置 >> "!LOG_FILE!"
echo   开始时间: %date% %time% >> "!LOG_FILE!"
echo ================================== >> "!LOG_FILE!"
echo.

echo ==================================
echo   微信小游戏自动化构建和配置
echo   日志文件: !LOG_FILE!
echo ==================================
echo.

echo [%time%] 步骤1: 检查Python环境... >> "!LOG_FILE!"
python --version
if errorlevel 1 (
    echo [错误] 未找到Python >> "!LOG_FILE!"
    echo [错误] 未找到Python，请先安装Python 3.x
    pause
    exit /b 1
) else (
    echo [成功] Python环境正常 >> "!LOG_FILE!"
    echo [成功] Python环境正常
)

echo.

echo [%time%] 步骤2: 执行构建脚本... >> "!LOG_FILE!"
if exist "buildWeChat.bat" (
    echo 找到 buildWeChat.bat，开始执行... >> "!LOG_FILE!"
    echo 找到 buildWeChat.bat，开始执行...
    
    echo [%time%] 开始执行 buildWeChat.bat >> "!LOG_FILE!"
    call buildWeChat.bat
    set BUILD_RESULT=!errorlevel!
    echo [%time%] buildWeChat.bat 执行完成，退出代码: !BUILD_RESULT! >> "!LOG_FILE!"
    
    if !BUILD_RESULT! equ 0 (
        echo [成功] 构建脚本执行完成 >> "!LOG_FILE!"
        echo [成功] 构建脚本执行完成
    ) else (
        echo [错误] 构建脚本执行失败，退出代码: !BUILD_RESULT! >> "!LOG_FILE!"
        echo [错误] 构建脚本执行失败！
        pause
        exit /b 1
    )
) else (
    echo [警告] 未找到 buildWeChat.bat，跳过构建步骤 >> "!LOG_FILE!"
    echo [警告] 未找到 buildWeChat.bat，跳过构建步骤
)

echo.

echo [%time%] 步骤3: 修改配置文件... >> "!LOG_FILE!"
echo 修改配置文件...
python modify_config.py
set MODIFY_RESULT=!errorlevel!
echo [%time%] 配置文件修改完成，退出代码: !MODIFY_RESULT! >> "!LOG_FILE!"

echo.
echo ================================== >> "!LOG_FILE!"
if !MODIFY_RESULT! equ 0 (
    echo [成功] 所有操作完成！ >> "!LOG_FILE!"
    echo [成功] 所有操作完成！
) else (
    echo [错误] 配置文件修改失败！ >> "!LOG_FILE!"
    echo [错误] 配置文件修改失败！
)
echo ================================== >> "!LOG_FILE!"

echo.
echo 详细日志请查看: !LOG_FILE!
pause