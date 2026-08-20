import type {ColorValue, ViewProps} from 'react-native';
import type {
  Float,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';

export interface NativeProps extends ViewProps {
  enabled?: WithDefault<boolean, false>;
  distance?: WithDefault<Float, 12>;
  toolbar?: WithDefault<boolean, false>;
  toolbarDoneText?: WithDefault<string, 'Done'>;
  toolbarPreviousNext?: WithDefault<boolean, false>;
  toolbarPlaceholder?: WithDefault<boolean, false>;
  toolbarTintColor?: ColorValue;
  toolbarBarTintColor?: ColorValue;
  keyboardAppearance?: WithDefault<string, ''>;
}

export default codegenNativeComponent<NativeProps>('RNFormKeyboardManagerView', {
  excludedPlatforms: ['android'],
});
