// android studio 中的AppActivity代码部分
// /****************************************************************************
// Copyright (c) 2015-2016 Chukong Technologies Inc.
// Copyright (c) 2017-2018 Xiamen Yaji Software Co., Ltd.
 
// http://www.cocos2d-x.org

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
// ****************************************************************************/
// package org.cocos2dx.javascript;

// import org.cocos2dx.lib.Cocos2dxActivity;
// import org.cocos2dx.lib.Cocos2dxGLSurfaceView;

// import android.app.Activity;
// import android.database.Cursor;
// import android.net.Uri;
// import android.os.Bundle;

// import android.content.Intent;
// import android.content.res.Configuration;
// import android.provider.MediaStore;

// public class AppActivity extends Cocos2dxActivity {

//     private static final int REQUEST_IMAGE_PICK = 1;
//     private static volatile Activity mCurrentActivity;

//     @Override
//     protected void onCreate(Bundle savedInstanceState) {
//         super.onCreate(savedInstanceState);
//         // Workaround in
//         // https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
//         if (!isTaskRoot()) {
//             // Android launched another instance of the root activity into an existing task
//             // so just quietly finish and go away, dropping the user back into the activity
//             // at the top of the stack (ie: the last state of this task)
//             // Don't need to finish it again since it's finished in super.onCreate .
//             return;
//         }
//         // DO OTHER INITIALIZATION BELOW
//         SDKWrapper.getInstance().init(this);
//     }

//     @Override
//     public Cocos2dxGLSurfaceView onCreateView() {
//         Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
//         // TestCpp should create stencil buffer
//         glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);
//         SDKWrapper.getInstance().setGLSurfaceView(glSurfaceView, this);

//         return glSurfaceView;
//     }

//     @Override
//     protected void onResume() {
//         super.onResume();
//         SDKWrapper.getInstance().onResume();
//         setCurrentActivity(this);
//     }

//     @Override
//     protected void onPause() {
//         super.onPause();
//         SDKWrapper.getInstance().onPause();

//     }

//     @Override
//     protected void onDestroy() {
//         super.onDestroy();

//         // Workaround in https://stackoverflow.com/questions/16283079/re-launch-of-activity-on-home-button-but-only-the-first-time/16447508
//         if (!isTaskRoot()) {
//             return;
//         }

//         SDKWrapper.getInstance().onDestroy();

//     }

//     @Override
//     protected void onActivityResult(int requestCode, int resultCode, Intent data) {
//         super.onActivityResult(requestCode, resultCode, data);
//         SDKWrapper.getInstance().onActivityResult(requestCode, resultCode, data);
//         System.out.println("onActivityResult回调");
//         if (requestCode == REQUEST_IMAGE_PICK && resultCode == RESULT_OK && data != null) {
//             System.out.println("选择图片回调");
//             Uri uri = data.getData();
// //            callCocosMethod(uri);
//             String path = null;
//             if ("content".equalsIgnoreCase(uri.getScheme())) {
//                 // 如果是 content 类型的 URI
//                 String[] projection = { MediaStore.Images.Media.DATA };
//                 Cursor cursor = getContentResolver().query(uri, projection, null, null, null);
//                 if (cursor != null) {
//                     try {
//                         if (cursor.moveToFirst()) {
//                             int columnIndex = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
//                             path = cursor.getString(columnIndex);
//                         }
//                     } finally {
//                         cursor.close();
//                     }
//                 }
//             } else if ("file".equalsIgnoreCase(uri.getScheme())) {
//                 // 如果是 file 类型的 URI，直接获取路径
//                 path = uri.getPath();
//             }
//             callCocosMethod(path);
//         }
//     }

//     private void callCocosMethod(String uri) {
//         System.out.println("开始调用cocos方法");
//         org.cocos2dx.lib.Cocos2dxHelper.runOnGLThread(new Runnable() {
//             @Override
//             public void run() {
//                 org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge.evalString("Helloworld.onImageSelected('" + uri + "')");
//             }
//         });
//     }

//     @Override
//     protected void onNewIntent(Intent intent) {
//         super.onNewIntent(intent);
//         SDKWrapper.getInstance().onNewIntent(intent);
//     }

//     @Override
//     protected void onRestart() {
//         super.onRestart();
//         SDKWrapper.getInstance().onRestart();
//     }

//     @Override
//     protected void onStop() {
//         super.onStop();
//         SDKWrapper.getInstance().onStop();
//     }

//     @Override
//     public void onBackPressed() {
//         SDKWrapper.getInstance().onBackPressed();
//         super.onBackPressed();
//     }

//     @Override
//     public void onConfigurationChanged(Configuration newConfig) {
//         SDKWrapper.getInstance().onConfigurationChanged(newConfig);
//         super.onConfigurationChanged(newConfig);
//     }

//     @Override
//     protected void onRestoreInstanceState(Bundle savedInstanceState) {
//         SDKWrapper.getInstance().onRestoreInstanceState(savedInstanceState);
//         super.onRestoreInstanceState(savedInstanceState);
//     }

//     @Override
//     protected void onSaveInstanceState(Bundle outState) {
//         SDKWrapper.getInstance().onSaveInstanceState(outState);
//         super.onSaveInstanceState(outState);
//     }

//     @Override
//     protected void onStart() {
//         SDKWrapper.getInstance().onStart();
//         super.onStart();
//     }

//     public static void chooseImage() {
//         System.out.println("开始调用选择图片");
//         Intent intent = new Intent(Intent.ACTION_PICK);
//         intent.setType("image/*");
//         ((AppActivity)getCurrentActivity()).startActivityForResult(intent, REQUEST_IMAGE_PICK);
//     }

//     public static Activity getCurrentActivity() {
//         return mCurrentActivity;
//     }

//     public void setCurrentActivity(Activity activity) {
//         mCurrentActivity = activity;
//     }
// }