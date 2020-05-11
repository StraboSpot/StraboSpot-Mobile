import React from 'react';
import {Alert, Platform} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {useDispatch, useSelector} from 'react-redux';
import {getNewId} from '../../shared/Helpers';
import {Base64} from 'js-base64';
import ImageResizer from 'react-native-image-resizer';
// Hooks
import useHomeHook from '../home/useHome';
import useServerRequests from '../../services/useServerRequests';
import {homeReducers} from '../home/home.constants';
import {spotReducers} from '../spots/spot.constants';

const RNFS = require('react-native-fs');

const useImages = () => {
  // let imageFiles = [];
  let imageArr = [];
  let imageCount = 0;
  let dirs = RNFetchBlob.fs.dirs;
  // const url = 'https://strabospot.org/testimages/images.json';
  const devicePath = Platform.OS === 'ios' ? dirs.DocumentDir : dirs.SDCardDir; // ios : android
  const appDirectory = '/StraboSpot';
  const imagesResizeTemp = '/TempImages';
  const imagesDirectory = devicePath + appDirectory + '/Images';

  const [useHome] = useHomeHook();
  const [serverRequests] = useServerRequests();

  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const deleteTempImagesFolder = async () => {
    return await RNFetchBlob.fs.unlink(devicePath + imagesResizeTemp);
  };

  const downloadImages = neededImageIds => {
    let promises = [];
    let imagesDownloadedCount = 0;
    let imagesFailedCount = 0;
    let savedImagesCount = 0;
    let imagesFailedArr = [];
    dispatch({type: 'ADD_STATUS_MESSAGE', statusMessage: 'Downloading Images...'});

    const downloadImageAndSave = async (imageId) => {
      const imageURI = 'https://strabospot.org/pi/' + imageId;
      // return new Promise((resolve, reject) => {
      return RNFetchBlob
        .config({path: imagesDirectory + '/' + imageId + '.jpg'})
        .fetch('GET', imageURI, {})
        .then((res) => {
          if (res.respInfo.status === 404) {
            imageCount++;
            imagesFailedCount++;
            console.log('Error on', imageId);  // Android Error: RNFetchBlob request error: url == nullnull
            return RNFetchBlob.fs.unlink(res.data).then(() => {
              console.log('Failed image removed', imageId);
              return Promise.reject('404 status');
            });
          }
          else {
            imageCount++;
            // imageFiles.push(res.path());
            console.log(imageCount, 'File saved to', res.path());
            // return convertImageSize(res.path());
          }
        })
        .catch((errorMessage, statusCode) => {
          imageCount++;
          console.log('Error on', imageId, ':', errorMessage, statusCode);  // Android Error: RNFetchBlob request error: url == nullnull
          return Promise.reject();
        });
      // });
    };

    neededImageIds.map(imageId => {
      let promise = downloadImageAndSave(imageId).then(() => {
        imagesDownloadedCount++;
        savedImagesCount++;
        console.log(
          'NEW/MODIFIED Images Downloaded: ' + imagesDownloadedCount + ' of ' + neededImageIds.length +
          ' NEW/MODIFIED Images Saved: ' + savedImagesCount + ' of ' + neededImageIds.length);
      }, err => {
        imagesFailedCount++;
        console.warn('Error downloading Image', imageId, 'Error:', err);
        RNFetchBlob.fs.unlink(imagesDirectory + '/' + imageId).then(() => {
          console.log('Image removed', imageId);
          imagesFailedArr.push(imageId);
        });
      }).finally(() => {
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        if (imagesFailedCount > 0) {
          dispatch({
            type: homeReducers.ADD_STATUS_MESSAGE,
            statusMessage: 'Downloaded Images ' + imageCount + '/' + neededImageIds.length
              + '\nFailed Images ' + imagesFailedCount + '/' + neededImageIds.length,
          });
        }
        else {
          dispatch({
            type: homeReducers.ADD_STATUS_MESSAGE,
            statusMessage: 'Downloaded Images: ' + imageCount + '/' + neededImageIds.length,
          });
        }
      });
      promises.push(promise);
    });
    return Promise.all(promises).then(() => {
      if (imagesFailedCount > 0) {
        //downloadErrors = true;
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch(
          {type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Image Downloads Failed: ' + imagesFailedCount});
        console.warn('Image Downloads Failed: ' + imagesFailedCount);
      }
      else  {
        dispatch({type: homeReducers.SET_LOADING, view: 'modal', bool: false});
        // dispatch({type:  homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Download Complete!'});
      }
    });
  };

  // const formatBytes = (a,b) => {
  //   if (a === 0) return '0 Bytes';
  //   const c = 1024;
  //   const d = b || 2;
  //   const sizes = ['Bytes','KB','MB','GB','TB','PB','EB','ZB','YB'];
  //   const i = Math.floor(Math.log(a) / Math.log(c));
  //
  //   return parseFloat((a / Math.pow(c,i)).toFixed(d)) + ' ' + sizes[i];
  // };

  // Checks to see if image is already on device
  const doesImageExist = async (imageId) => {
    const filePath = imagesDirectory;
    const fileName = imageId.toString() + '.jpg';
    const fileURI = filePath + '/' + fileName;
    console.log('Looking on device for file URI: ', fileURI);
    return await RNFetchBlob.fs.exists(fileURI).then(exist => {
        console.log(`File URI ${fileURI} does ${exist ? '' : 'not'} exist on device`);
        return exist;
      },
    )
      .catch((err) => {
        throw err;
      });
  };

  const launchCameraFromNotebook = async () => {
    try {
      const savedPhoto = await takePicture();
      const photoProperties = {
        id: savedPhoto.id,
        src: savedPhoto.src,
        image_type: 'photo',
        height: savedPhoto.height,
        width: savedPhoto.width,
      };
      useHome.toggleLoading(true);
      if (savedPhoto === 'cancelled') {
        if (imageArr.length > 0) {
          console.log('ALL PHOTOS SAVED', imageArr);
          dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: imageArr});
          // props.onSpotEditImageObj(imageArr);
          useHome.toggleLoading(false);
          // toggleToast();
          return Promise.resolve(imageArr.length);
        }
        else {
          useHome.toggleLoading(false);
          Alert.alert('No Photos To Save', 'please try again...');
        }
      }
      else {
        // setAllPhotosSaved(oldArray => ([...oldArray, photoProperties]));
        imageArr.push(photoProperties);
        console.log('Photos Saved:', imageArr);
        return launchCameraFromNotebook();
      }
    }
    catch (e) {
      Alert.alert('Error Getting Photo!');
      useHome.toggleLoading(false);
    }
  };

  // const launchCameraFromNotebook = () => {
  //   // try {
  //     return takePicture().then((savedPhoto) => {
  //       const photoProperties = {
  //         id: savedPhoto.id,
  //         src: savedPhoto.src,
  //         image_type: 'photo',
  //         height: savedPhoto.height,
  //         width: savedPhoto.width,
  //       };
  //       useHome.toggleLoading(true);
  //       if (savedPhoto === 'cancelled') {
  //         if (imageArr.length > 0) {
  //           console.log('ALL PHOTOS SAVED', imageArr);
  //           dispatch({type: spotReducers.EDIT_SPOT_IMAGES, images: imageArr});
  //           // props.onSpotEditImageObj(imageArr);
  //           useHome.toggleLoading(false);
  //           // toggleToast();
  //           return Promise.resolve(imageArr.length);
  //         }
  //         else {
  //           useHome.toggleLoading(false);
  //           Alert.alert('No Photos To Save', 'please try again...');
  //         }
  //       }
  //       else {
  //         // setAllPhotosSaved(oldArray => ([...oldArray, photoProperties]));
  //         imageArr.push(photoProperties);
  //         console.log('Photos Saved:', imageArr);
  //         return launchCameraFromNotebook();
  //       }
  //     })
  //   // }
  //   // catch (e) {
  //   //   Alert.alert('Error Getting Photo!');
  //   //   useHome.toggleLoading(false);
  //   // }
  // };

  const gatherNeededImages = async (spots) => {
    let neededImagesIds = [];
    const promises = [];

    spots.map(spot => {
      if (spot.properties.images) {
        spot.properties.images.map((image) => {
          const promise = doesImageExist(image.id).then((exists) => {
            if (!exists) {
              console.log('Need to download image', image.id);
              neededImagesIds.push(image.id);
            }
            else console.log('Image', image.id, 'already exists on device. Not downloading.');
          });
          promises.push(promise);
        });
      }
      else console.log('No images to download');
    });
    return Promise.all(promises).then(() => {
      // Alert.alert(`Images needed to download: ${neededImagesIds.length}`);
      return Promise.resolve(neededImagesIds);
    });
  };

  const getImageFileURIById = (imageId) => {
    const filePath = imagesDirectory;
    const fileName = imageId.toString() + '.jpg';
    const fileURI = filePath + '/' + fileName;
    return doesImageExist(imageId).then((exists) => {
      if (exists) {
        console.log('Found image file.', fileURI);
        return Promise.resolve(fileURI);
      }
      else {
        console.log('File not found');
        return Promise.reject('img/image-not-found.png');
      }
    });
  };

  const getImageSize = image => {
    return RNFetchBlob.fs.readFile(image, 'base64')
      .then((data) => {
        const decodedData = Base64.decode(data);
        return decodedData.length;
      });
  };

  const getLocalImageSrc = id => {
    const imageSrc = imagesDirectory + '/' + id + '.jpg';
    // console.count('Image Number');
    // console.log('Loading image from', Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc);
    return Platform.OS === 'ios' ? imageSrc : 'file://' + imageSrc;
  };

  // Called from Image Gallery and displays image source picker
  const pictureSelectDialog = async () => {
    const imageOptionsPicker = {
      storageOptions: {
        skipBackup: true,
      },
      title: 'Choose Photo Source',
    };
    return new Promise((resolve, reject) => {
      ImagePicker.showImagePicker(imageOptionsPicker, async (response) => {
        console.log('Response = ', response);

        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve('cancelled');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
          return reject('Error', response.error);
        }
        else {
          try {
            const savedPhoto = await saveFile(response);
            console.log('Saved Photo = ', savedPhoto);
            resolve(savedPhoto);
          }
          catch (e) {
            reject();
          }
        }
      });
    });
  };

  const saveFile = async (imageURI) => {
    let uriParts = imageURI.uri.split('/');
    // let imageName = uriParts[uriParts.length - 1];
    let imageId = getNewId();
    return new Promise((resolve, reject) => {
      RNFetchBlob
        .config({path: imagesDirectory + '/' + imageId + '.jpg'})
        .fetch('GET', imageURI.uri, {})
        .then((res) => {
          imageCount++;
          console.log(imageCount, 'File saved to', res.path());
          // let imageId = imageName.split('.')[0];
          let imageData = {};
          if (Platform.OS === 'ios') {
            imageData = {
              id: imageId,
              src: res.path(),
              height: imageURI.height,
              width: imageURI.width,
            };
          }
          else imageData = {id: imageId, src: 'file://' + res.path(), height: imageURI.height, width: imageURI.width};
          resolve(imageData);
        })
        .catch((errorMessage, statusCode) => {
          imageCount++;
          console.log('Error on', imageId, ':', errorMessage, statusCode);  // Android Error: RNFetchBlob request error: url == nullnull
          reject();
        });
    });
  };

  // Called from Notebook Panel Footer and opens camera only
  const takePicture = async () => {
    const imageOptionsCamera = {
      storageOptions: {
        skipBackup: true,
        takePhotoButtonTitle: 'Take Photo Buddy!',
        chooseFromLibraryButtonTitle: 'choose photo from library',
        waitUntilSaved: true,
      },
      noData: true,
    };
    // console.log('aassaasswwww')
    return new Promise((resolve, reject) => {
      ImagePicker.launchCamera(imageOptionsCamera, async (response) => {
        console.log('Response = ', response);
        if (response.didCancel) {
          console.log('User cancelled image picker');
          resolve('cancelled');
        }
        else if (response.error) {
          console.log('ImagePicker Error: ', response.error);
        }
        else {
          try {
            const savedPhoto = await saveFile(response);
            console.log('Saved Photo = ', savedPhoto);
            // Deletes default path after every photo saved to /StraboSpot/Images.
            RNFS.unlink(response.uri).then(() => {
              console.log('Image default path is unlinked:');
              resolve(savedPhoto);
            })
              .catch(err => console.log('Image unlink error', err.message));
          }
          catch (e) {
            reject();
          }
        }
      });
    });
  };

  const uploadImages = spots => {
    return new Promise((resolve, reject) => {
      spots = Object.values(spots);
      let imagesToUploadCount = 0;
      let imagesUploadedCount = 0;
      let imagesUploadFailedCount = 0;
      let iSpotLoop = 0;
      let iImagesLoop = 0;

      console.log('Gathering images to upload', spots);

      const areMoreImages = (spot) => {
        return spot.properties && spot.properties.images && iImagesLoop < spot.properties.images.length;
      };

      const areMoreSpots = () => {
        return iSpotLoop + 1 < spots.length;
      };

      const getImageFile = async imageProps => {
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Processing Image...'});
        console.log(imageProps);
        const src = await getImageFileURIById(imageProps.id);
        if (src !== 'img/image-not-found.png') {
          return Promise.resolve([imageProps, src]);
        }
        else return Promise.reject('Local file not found for image', imageProps.id);
      };

      const makeNextSpotRequest = (spot) => {
        if (areMoreImages(spot)) {
          console.log('Found image:', spot.properties.images[iImagesLoop].id, spot.properties.images[iImagesLoop],
            'in Spot:', spot.properties.name);
          makeNextImageRequest(spot.properties.images[iImagesLoop]).then(() => {
            console.log('Making Next spot request');
            makeNextSpotRequest(spots[iSpotLoop]);
          });
        }
        else if (areMoreSpots()) {
          iSpotLoop++;
          iImagesLoop = 0;
          makeNextSpotRequest(spots[iSpotLoop]);
        }
        else {
          if (imagesToUploadCount === 0) {
            console.log('No NEW images to upload');
            dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
            dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'No NEW images to upload'});
          }
          else {
            console.log('Finished Uploading Images');
            if (imagesUploadFailedCount > 0) Alert.alert(`'Images Failed:' ${imagesUploadFailedCount}`);
          }
          resolve();
        }
      };

      const makeNextImageRequest = (imageProps) => {
        return shouldUploadImage(imageProps)
          .then(getImageFile)
          .then(uploadImage)
          .catch(function (err) {
            if (err !== 'already exists') {
              imagesUploadFailedCount++;
              console.warn(err);
            }
          })
          .finally(function () {
            iImagesLoop++;
            return Promise.resolve();
          });
      };

      const shouldUploadImage = async (imageProps) => {
        return serverRequests.verifyImageExistence(imageProps.id, user.encoded_login)
          .then(response => {
            if (response
              && ((response.modified_timestamp && imageProps.modified_timestamp
                && imageProps.modified_timestamp > response.modified_timestamp)
                || (!response.modified_timestamp && imageProps.modified_timestamp))) {
              console.log('Need to upload image:', imageProps.id);
              imagesToUploadCount++;
              return Promise.resolve(imageProps);
            }
            else {
              console.log('No need to upload image:', imageProps.id, 'Server response:', response);
              return Promise.reject('already exists');
            }
          }, () => {
            imagesToUploadCount++;
            console.log('Need to upload image:', imageProps.id);
            return Promise.resolve(imageProps);
          });
      };

      const resizeImageForUpload = (imageFile, imageProps) => {
        const max_size = 2000;
        let height = imageProps.height;
        let width = imageProps.width;

        if (width > height && width > max_size) {
          height = max_size * height / width;
          width = max_size;
        }
        else if (height > max_size) {
          width = max_size * width / height;
          height = max_size;
        }
        return ImageResizer.createResizedImage(
          imageFile,
          width,
          height,
          'JPEG',
          100,
          0,
          devicePath + imagesResizeTemp,
        )
          .then(response => {
            response.name = imageProps.id.toString();
            if (response.size < 1024) console.log(response.size + ' Bytes');
            else if (response.size < 1048576) console.log('Resize Image KB:' + (response.size / 1024).toFixed(3) + ' KB');
            else if (response.size < 1073741824) console.log('Resize Image MB:' + (response.size / 1048576).toFixed(2) + ' MB');
            else console.log('Resize Image' + (response.size / 1073741824).toFixed(3) + ' GB');
            return response;
          })
          .catch((err) => {
            Alert.alert('Image Resize Error', err);
          });
      };

      const uploadImage = async (data) => {
        const imageProps = data[0];
        const src = data[1];
        const count = imagesUploadedCount + 1;
        dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
        dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploading image: ' + count + '...'});
        console.log('Uploading image', imageProps.id, 'to server...');

        const resizeImage = await resizeImageForUpload(src, imageProps);
        const uploadURI = Platform.OS === 'ios' ? resizeImage.path.replace('file//', '') : resizeImage.path;
        // console.log('Image re-sized obj', resizeImage);

        let formdata = new FormData();
        formdata.append('image_file', {uri: uploadURI, name: 'image.jpg', type: 'image/jpeg'});
        formdata.append('id', imageProps.id);
        formdata.append('modified_timestamp', Date.now());
        const bytes = await getImageSize(resizeImage.path);
        if (bytes < 1024) console.log(bytes + ' Bytes');
        else if (bytes < 1048576) console.log('KB:' + (bytes / 1024).toFixed(3) + ' KB');
        else if (bytes < 1073741824) console.log('MB:' + (bytes / 1048576).toFixed(2) + ' MB');
        else console.log((bytes / 1073741824).toFixed(3) + ' GB');
        // console.time();
        return serverRequests.uploadImage(formdata, user.encoded_login)
          .then((res) => {
              // console.timeEnd();
              imagesUploadedCount++;
              console.log('Image Uploaded!' + imagesUploadedCount);
              console.log('Finished uploading image', imageProps.id, 'to the server');
              dispatch({type: homeReducers.REMOVE_LAST_STATUS_MESSAGE});
              dispatch({type: homeReducers.ADD_STATUS_MESSAGE, statusMessage: 'Uploaded Images', imagesUploadedCount});
              return Promise.resolve();
            },
            (err) => Promise.reject('Error uploading image' + imageProps.id) + '\n' + err)
          .catch((err) => {
            console.error('Image Upload Error', err);
            Alert.alert('Image Upload Error', err);
          });
      };

      if (iSpotLoop < spots.length) makeNextSpotRequest(spots[iSpotLoop]);
      else resolve();
    });
  };

  return [{
    deleteTempImagesFolder: deleteTempImagesFolder,
    downloadImages: downloadImages,
    gatherNeededImages: gatherNeededImages,
    getLocalImageSrc: getLocalImageSrc,
    launchCameraFromNotebook: launchCameraFromNotebook,
    pictureSelectDialog: pictureSelectDialog,
    takePicture: takePicture,
    uploadImages: uploadImages,
  }];
};

export default useImages;
