#import <React/RCTViewComponentView.h>

@interface RNFormKeyboardManagerView : RCTViewComponentView

@property (nonatomic, assign, getter=isEnabled) BOOL enabled;
@property (nonatomic, assign) CGFloat distance;
@property (nonatomic, assign) BOOL toolbar;
@property (nonatomic, copy) NSString *toolbarDoneText;
@property (nonatomic, assign) BOOL toolbarPreviousNext;
@property (nonatomic, assign) BOOL toolbarPlaceholder;
@property (nonatomic, strong) UIColor *toolbarTintColor;
@property (nonatomic, strong) UIColor *toolbarBarTintColor;
@property (nonatomic, copy) NSString *keyboardAppearance;

@end
