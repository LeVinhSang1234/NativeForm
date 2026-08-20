#import "RNFormKeyboardManagerView.h"

#import <React/RCTConversions.h>
#import <react/renderer/components/RNFormKeyboardManagerSpec/ComponentDescriptors.h>
#import <react/renderer/components/RNFormKeyboardManagerSpec/Props.h>

using namespace facebook::react;

static CGFloat const RNFormKeyboardDefaultDistance = 12.0;
static CGFloat const RNFormKeyboardToolbarHeight = 44.0;
static NSString *const RNFormKeyboardDefaultDoneText = @"Done";

@interface RNFormKeyboardManagerView ()

@property (nonatomic, assign) CGRect keyboardFrame;
@property (nonatomic, assign) CGFloat currentOffset;
@property (nonatomic, weak) UIScrollView *managedScrollView;
@property (nonatomic, assign) UIEdgeInsets originalContentInset;
@property (nonatomic, assign) UIEdgeInsets originalIndicatorInsets;
@property (nonatomic, assign) BOOL savedScrollInsets;
@property (nonatomic, strong) UIToolbar *toolbarView;

@end

@implementation RNFormKeyboardManagerView

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    _props = RNFormKeyboardManagerViewShadowNode::defaultSharedProps();
    _keyboardFrame = CGRectNull;
    _distance = RNFormKeyboardDefaultDistance;
    _toolbarDoneText = RNFormKeyboardDefaultDoneText;
    _keyboardAppearance = @"";
    NSNotificationCenter *center = NSNotificationCenter.defaultCenter;
    [center addObserver:self
               selector:@selector(keyboardWillChangeFrame:)
                   name:UIKeyboardWillChangeFrameNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(textInputDidBeginEditing:)
                   name:UITextFieldTextDidBeginEditingNotification
                 object:nil];
    [center addObserver:self
               selector:@selector(textInputDidBeginEditing:)
                   name:UITextViewTextDidBeginEditingNotification
                 object:nil];
  }
  return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &oldViewProps =
      static_cast<const RNFormKeyboardManagerViewProps &>(*_props);
  const auto &newViewProps =
      static_cast<const RNFormKeyboardManagerViewProps &>(*props);

  if (oldViewProps.distance != newViewProps.distance) {
    self.distance = newViewProps.distance;
  }

  if (oldViewProps.toolbarDoneText != newViewProps.toolbarDoneText) {
    self.toolbarDoneText = RCTNSStringFromString(newViewProps.toolbarDoneText);
  }

  if (oldViewProps.toolbarPreviousNext != newViewProps.toolbarPreviousNext) {
    self.toolbarPreviousNext = newViewProps.toolbarPreviousNext;
  }

  if (oldViewProps.toolbarPlaceholder != newViewProps.toolbarPlaceholder) {
    self.toolbarPlaceholder = newViewProps.toolbarPlaceholder;
  }

  if (oldViewProps.toolbarTintColor != newViewProps.toolbarTintColor) {
    self.toolbarTintColor = RCTUIColorFromSharedColor(newViewProps.toolbarTintColor);
  }

  if (oldViewProps.toolbarBarTintColor != newViewProps.toolbarBarTintColor) {
    self.toolbarBarTintColor =
        RCTUIColorFromSharedColor(newViewProps.toolbarBarTintColor);
  }

  if (oldViewProps.keyboardAppearance != newViewProps.keyboardAppearance) {
    self.keyboardAppearance =
        RCTNSStringFromString(newViewProps.keyboardAppearance);
  }

  if (oldViewProps.toolbar != newViewProps.toolbar) {
    self.toolbar = newViewProps.toolbar;
  }

  if (oldViewProps.enabled != newViewProps.enabled) {
    self.enabled = newViewProps.enabled;
  }

  [super updateProps:props oldProps:oldProps];
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  // super assigns self.frame, which UIKit leaves undefined while a transform is
  // applied. Drop the offset for the assignment and put it back after.
  CGAffineTransform offset = self.transform;
  BOOL isOffset = !CGAffineTransformIsIdentity(offset);
  if (isOffset) {
    self.transform = CGAffineTransformIdentity;
  }
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
  if (isOffset) {
    self.transform = offset;
  }
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<
      RNFormKeyboardManagerViewComponentDescriptor>();
}

- (void)prepareForRecycle
{
  self.enabled = NO;
  self.toolbar = NO;
  self.distance = RNFormKeyboardDefaultDistance;
  self.toolbarDoneText = RNFormKeyboardDefaultDoneText;
  self.toolbarPreviousNext = NO;
  self.toolbarPlaceholder = NO;
  self.toolbarTintColor = nil;
  self.toolbarBarTintColor = nil;
  self.keyboardAppearance = @"";
  self.toolbarView = nil;
  [super prepareForRecycle];
}

- (void)dealloc
{
  [NSNotificationCenter.defaultCenter removeObserver:self];
}

#pragma mark - Props

- (void)setEnabled:(BOOL)enabled
{
  if (_enabled == enabled) {
    return;
  }
  _enabled = enabled;
  if (!enabled) {
    [self detachToolbarFromInputs];
    [self restoreWithDuration:0.2 options:UIViewAnimationOptionCurveEaseInOut];
    return;
  }
  [self applyKeyboardConfigToFirstResponder];
}

- (void)setDistance:(CGFloat)distance
{
  if (_distance == distance) {
    return;
  }
  _distance = distance;
  if (self.isEnabled && [self keyboardIsVisible]) {
    [self updateForFirstResponderWithDuration:0.25
                                      options:UIViewAnimationOptionCurveEaseInOut];
  }
}

- (void)setToolbar:(BOOL)toolbar
{
  if (_toolbar == toolbar) {
    return;
  }
  _toolbar = toolbar;
  if (!toolbar) {
    [self detachToolbarFromInputs];
    return;
  }
  [self applyKeyboardConfigToFirstResponder];
}

- (void)setToolbarDoneText:(NSString *)toolbarDoneText
{
  NSString *text = toolbarDoneText.length > 0 ? [toolbarDoneText copy]
                                              : RNFormKeyboardDefaultDoneText;
  if ([_toolbarDoneText isEqualToString:text]) {
    return;
  }
  _toolbarDoneText = text;
  [self applyKeyboardConfigToFirstResponder];
}

- (void)setToolbarPreviousNext:(BOOL)toolbarPreviousNext
{
  if (_toolbarPreviousNext == toolbarPreviousNext) {
    return;
  }
  _toolbarPreviousNext = toolbarPreviousNext;
  [self applyKeyboardConfigToFirstResponder];
}

- (void)setToolbarPlaceholder:(BOOL)toolbarPlaceholder
{
  if (_toolbarPlaceholder == toolbarPlaceholder) {
    return;
  }
  _toolbarPlaceholder = toolbarPlaceholder;
  [self applyKeyboardConfigToFirstResponder];
}

- (void)setToolbarTintColor:(UIColor *)toolbarTintColor
{
  _toolbarTintColor = toolbarTintColor;
  [self applyKeyboardConfigToFirstResponder];
}

- (void)setToolbarBarTintColor:(UIColor *)toolbarBarTintColor
{
  _toolbarBarTintColor = toolbarBarTintColor;
  [self applyKeyboardConfigToFirstResponder];
}

- (void)setKeyboardAppearance:(NSString *)keyboardAppearance
{
  NSString *appearance = [keyboardAppearance copy] ?: @"";
  if ([_keyboardAppearance isEqualToString:appearance]) {
    return;
  }
  _keyboardAppearance = appearance;
  [self applyKeyboardConfigToFirstResponder];
}

#pragma mark - Keyboard

- (void)didMoveToWindow
{
  [super didMoveToWindow];
  if (self.window == nil) {
    [self restoreWithDuration:0 options:UIViewAnimationOptionCurveEaseInOut];
  }
}

- (void)keyboardWillChangeFrame:(NSNotification *)notification
{
  NSDictionary *userInfo = notification.userInfo;
  CGRect screenFrame = [userInfo[UIKeyboardFrameEndUserInfoKey] CGRectValue];
  NSTimeInterval duration = [userInfo[UIKeyboardAnimationDurationUserInfoKey] doubleValue];
  UIViewAnimationCurve curve =
      (UIViewAnimationCurve)[userInfo[UIKeyboardAnimationCurveUserInfoKey] integerValue];
  UIViewAnimationOptions options = (UIViewAnimationOptions)(curve << 16);

  if (self.window != nil) {
    self.keyboardFrame = [self.window convertRect:screenFrame fromWindow:nil];
  } else {
    self.keyboardFrame = screenFrame;
  }

  if (!self.isEnabled || ![self keyboardIsVisible]) {
    [self restoreWithDuration:duration options:options];
    return;
  }

  [self updateForFirstResponderWithDuration:duration options:options];
}

- (void)textInputDidBeginEditing:(NSNotification *)notification
{
  UIView *input = notification.object;
  if (!self.isEnabled || ![input isDescendantOfView:self]) {
    return;
  }
  [self applyKeyboardConfigToInput:input];
  if (![self keyboardIsVisible]) {
    return;
  }
  [self updateForFirstResponderWithDuration:0.25
                                    options:UIViewAnimationOptionCurveEaseInOut];
}

- (BOOL)keyboardIsVisible
{
  if (self.window == nil || CGRectIsNull(self.keyboardFrame)) {
    return NO;
  }
  return CGRectIntersectsRect(self.window.bounds, self.keyboardFrame) &&
      CGRectGetMinY(self.keyboardFrame) < CGRectGetMaxY(self.window.bounds);
}

- (UIView *)findFirstResponderInView:(UIView *)view
{
  if (view.isFirstResponder) {
    return view;
  }
  for (UIView *subview in view.subviews) {
    UIView *responder = [self findFirstResponderInView:subview];
    if (responder != nil) {
      return responder;
    }
  }
  return nil;
}

- (UIScrollView *)nearestScrollView
{
  UIView *ancestor = self.superview;
  while (ancestor != nil) {
    if ([ancestor isKindOfClass:UIScrollView.class]) {
      return (UIScrollView *)ancestor;
    }
    ancestor = ancestor.superview;
  }
  return nil;
}

- (void)updateForFirstResponderWithDuration:(NSTimeInterval)duration
                                     options:(UIViewAnimationOptions)options
{
  UIView *responder = [self findFirstResponderInView:self];
  UIWindow *window = self.window;
  if (responder == nil || window == nil) {
    [self restoreWithDuration:duration options:options];
    return;
  }

  CGRect responderFrame = [responder convertRect:responder.bounds toView:window];
  CGFloat overlap = CGRectGetMaxY(responderFrame) + self.distance -
      CGRectGetMinY(self.keyboardFrame);
  BOOL overlapsKeyboardHorizontally =
      CGRectGetMaxX(responderFrame) > CGRectGetMinX(self.keyboardFrame) &&
      CGRectGetMinX(responderFrame) < CGRectGetMaxX(self.keyboardFrame);
  if (!overlapsKeyboardHorizontally) {
    // A split or floating keyboard that misses the input sideways hides nothing,
    // so give back any offset taken for a previous responder.
    [self restoreWithDuration:duration options:options];
    return;
  }

  UIScrollView *scrollView = [self nearestScrollView];
  if (scrollView != nil) {
    [self manageScrollView:scrollView
                   overlap:MAX(0, overlap)
                  duration:duration
                   options:options];
    return;
  }

  CGFloat desiredOffset = MAX(0, overlap + self.currentOffset);
  self.currentOffset = desiredOffset;
  [UIView animateWithDuration:duration
                        delay:0
                      options:options | UIViewAnimationOptionBeginFromCurrentState
                   animations:^{
                     self.transform = CGAffineTransformMakeTranslation(0, -desiredOffset);
                   }
                   completion:nil];
}

- (void)manageScrollView:(UIScrollView *)scrollView
                 overlap:(CGFloat)overlap
                duration:(NSTimeInterval)duration
                 options:(UIViewAnimationOptions)options
{
  if (!self.savedScrollInsets || self.managedScrollView != scrollView) {
    [self restoreManagedScrollView];
    self.managedScrollView = scrollView;
    self.originalContentInset = scrollView.contentInset;
    self.originalIndicatorInsets = scrollView.verticalScrollIndicatorInsets;
    self.savedScrollInsets = YES;
  }

  CGRect scrollFrame = [scrollView convertRect:scrollView.bounds toView:self.window];
  CGFloat keyboardOverlap = MAX(0, CGRectGetMaxY(scrollFrame) - CGRectGetMinY(self.keyboardFrame));
  UIEdgeInsets contentInset = self.originalContentInset;
  UIEdgeInsets indicatorInsets = self.originalIndicatorInsets;
  contentInset.bottom += keyboardOverlap;
  indicatorInsets.bottom += keyboardOverlap;
  CGPoint contentOffset = scrollView.contentOffset;
  if (overlap > 0) {
    contentOffset.y += overlap;
  }

  [UIView animateWithDuration:duration
                        delay:0
                      options:options | UIViewAnimationOptionBeginFromCurrentState
                   animations:^{
                     scrollView.contentInset = contentInset;
                     scrollView.verticalScrollIndicatorInsets = indicatorInsets;
                     [scrollView setContentOffset:contentOffset animated:NO];
                   }
                   completion:nil];
}

- (void)restoreManagedScrollView
{
  if (!self.savedScrollInsets || self.managedScrollView == nil) {
    return;
  }
  self.managedScrollView.contentInset = self.originalContentInset;
  self.managedScrollView.verticalScrollIndicatorInsets = self.originalIndicatorInsets;
  self.savedScrollInsets = NO;
  self.managedScrollView = nil;
}

- (void)restoreWithDuration:(NSTimeInterval)duration
                     options:(UIViewAnimationOptions)options
{
  UIScrollView *scrollView = self.managedScrollView;
  UIEdgeInsets contentInset = self.originalContentInset;
  UIEdgeInsets indicatorInsets = self.originalIndicatorInsets;
  BOOL restoreInsets = self.savedScrollInsets && scrollView != nil;
  self.savedScrollInsets = NO;
  self.managedScrollView = nil;
  self.currentOffset = 0;

  [UIView animateWithDuration:duration
                        delay:0
                      options:options | UIViewAnimationOptionBeginFromCurrentState
                   animations:^{
                     self.transform = CGAffineTransformIdentity;
                     if (restoreInsets) {
                       scrollView.contentInset = contentInset;
                       scrollView.verticalScrollIndicatorInsets = indicatorInsets;
                     }
                   }
                   completion:nil];
}

#pragma mark - Text inputs

- (void)collectTextInputsInView:(UIView *)view
                           into:(NSMutableArray<UIView *> *)result
{
  for (UIView *subview in view.subviews) {
    if (subview.isHidden || subview.alpha <= 0.01 || !subview.isUserInteractionEnabled) {
      continue;
    }
    if ([subview isKindOfClass:UITextField.class]) {
      if (((UITextField *)subview).isEnabled) {
        [result addObject:subview];
      }
      continue;
    }
    if ([subview isKindOfClass:UITextView.class]) {
      if (((UITextView *)subview).isEditable) {
        [result addObject:subview];
      }
      continue;
    }
    [self collectTextInputsInView:subview into:result];
  }
}

- (NSArray<UIView *> *)orderedTextInputs
{
  NSMutableArray<UIView *> *inputs = [NSMutableArray array];
  [self collectTextInputsInView:self into:inputs];
  [inputs sortUsingComparator:^NSComparisonResult(UIView *a, UIView *b) {
    CGRect frameA = [a convertRect:a.bounds toView:self];
    CGRect frameB = [b convertRect:b.bounds toView:self];
    if (ABS(CGRectGetMinY(frameA) - CGRectGetMinY(frameB)) > 1.0) {
      return CGRectGetMinY(frameA) < CGRectGetMinY(frameB) ? NSOrderedAscending
                                                           : NSOrderedDescending;
    }
    if (ABS(CGRectGetMinX(frameA) - CGRectGetMinX(frameB)) > 1.0) {
      return CGRectGetMinX(frameA) < CGRectGetMinX(frameB) ? NSOrderedAscending
                                                           : NSOrderedDescending;
    }
    return NSOrderedSame;
  }];
  return inputs;
}

- (UIView *)accessoryViewForInput:(UIView *)input
{
  if ([input isKindOfClass:UITextField.class]) {
    return ((UITextField *)input).inputAccessoryView;
  }
  if ([input isKindOfClass:UITextView.class]) {
    return ((UITextView *)input).inputAccessoryView;
  }
  return nil;
}

- (void)setAccessoryView:(UIView *)accessory forInput:(UIView *)input
{
  if ([input isKindOfClass:UITextField.class]) {
    ((UITextField *)input).inputAccessoryView = accessory;
    return;
  }
  if ([input isKindOfClass:UITextView.class]) {
    ((UITextView *)input).inputAccessoryView = accessory;
  }
}

- (NSString *)placeholderForInput:(UIView *)input
{
  if ([input isKindOfClass:UITextField.class]) {
    return ((UITextField *)input).placeholder;
  }
  if (![input respondsToSelector:@selector(placeholder)]) {
    return nil;
  }
  id placeholder = [input valueForKey:@"placeholder"];
  if ([placeholder isKindOfClass:NSString.class]) {
    return placeholder;
  }
  if ([placeholder isKindOfClass:NSAttributedString.class]) {
    return [(NSAttributedString *)placeholder string];
  }
  return nil;
}

#pragma mark - Toolbar

- (void)applyKeyboardConfigToFirstResponder
{
  if (!self.isEnabled) {
    return;
  }
  UIView *responder = [self findFirstResponderInView:self];
  if (responder == nil) {
    return;
  }
  [self applyKeyboardConfigToInput:responder];
}

- (void)applyKeyboardConfigToInput:(UIView *)input
{
  BOOL needsReload = [self applyKeyboardAppearanceToInput:input];
  if ([self applyToolbarToInput:input]) {
    needsReload = YES;
  }
  if (needsReload && input.isFirstResponder) {
    [input reloadInputViews];
  }
}

- (BOOL)applyKeyboardAppearanceToInput:(UIView *)input
{
  if (self.keyboardAppearance.length == 0) {
    return NO;
  }
  if (![input conformsToProtocol:@protocol(UITextInputTraits)]) {
    return NO;
  }
  id<UITextInputTraits> traits = (id<UITextInputTraits>)input;
  if (![traits respondsToSelector:@selector(keyboardAppearance)] ||
      ![traits respondsToSelector:@selector(setKeyboardAppearance:)]) {
    return NO;
  }

  UIKeyboardAppearance appearance = UIKeyboardAppearanceDefault;
  if ([self.keyboardAppearance isEqualToString:@"light"]) {
    appearance = UIKeyboardAppearanceLight;
  } else if ([self.keyboardAppearance isEqualToString:@"dark"]) {
    appearance = UIKeyboardAppearanceDark;
  }

  if (traits.keyboardAppearance == appearance) {
    return NO;
  }
  traits.keyboardAppearance = appearance;
  return YES;
}

- (BOOL)applyToolbarToInput:(UIView *)input
{
  UIView *accessory = [self accessoryViewForInput:input];

  if (!self.toolbar) {
    if (accessory != nil && accessory == self.toolbarView) {
      [self setAccessoryView:nil forInput:input];
      return YES;
    }
    return NO;
  }

  // Never replace an accessory view the application installed itself.
  if (accessory != nil && accessory != self.toolbarView) {
    return NO;
  }

  NSArray<UIView *> *inputs = [self orderedTextInputs];
  NSUInteger index = [inputs indexOfObject:input];
  UIToolbar *bar = [self toolbarViewOrCreate];

  bar.tintColor = self.toolbarTintColor;
  if (self.toolbarBarTintColor != nil) {
    bar.barTintColor = self.toolbarBarTintColor;
    bar.translucent = NO;
  } else {
    bar.barTintColor = nil;
    bar.translucent = YES;
  }

  NSMutableArray<UIBarButtonItem *> *items = [NSMutableArray array];
  if (self.toolbarPreviousNext) {
    UIBarButtonItem *previous =
        [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"chevron.up"]
                                         style:UIBarButtonItemStylePlain
                                        target:self
                                        action:@selector(toolbarPreviousPressed)];
    previous.enabled = index != NSNotFound && index > 0;
    UIBarButtonItem *gap =
        [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFixedSpace
                                                      target:nil
                                                      action:nil];
    gap.width = 16;
    UIBarButtonItem *next =
        [[UIBarButtonItem alloc] initWithImage:[UIImage systemImageNamed:@"chevron.down"]
                                         style:UIBarButtonItemStylePlain
                                        target:self
                                        action:@selector(toolbarNextPressed)];
    next.enabled = index != NSNotFound && index + 1 < inputs.count;
    [items addObject:previous];
    [items addObject:gap];
    [items addObject:next];
  }

  [items addObject:[self flexibleSpace]];

  if (self.toolbarPlaceholder) {
    NSString *placeholder = [self placeholderForInput:input];
    if (placeholder.length > 0) {
      [items addObject:[self titleItemWithPlaceholder:placeholder]];
      [items addObject:[self flexibleSpace]];
    }
  }

  UIBarButtonItem *done = [[UIBarButtonItem alloc] initWithTitle:self.toolbarDoneText
                                                           style:UIBarButtonItemStyleDone
                                                          target:self
                                                          action:@selector(toolbarDonePressed)];
  [items addObject:done];
  bar.items = items;

  if (accessory == bar) {
    // Already attached, the refreshed items apply without reloading the keyboard.
    return NO;
  }
  [self setAccessoryView:bar forInput:input];
  return YES;
}

- (UIBarButtonItem *)titleItemWithPlaceholder:(NSString *)placeholder
{
  // Kept inside a label so a long placeholder truncates instead of pushing the
  // done button out of the bar.
  UILabel *label = [[UILabel alloc] initWithFrame:CGRectZero];
  label.text = placeholder;
  label.font = [UIFont systemFontOfSize:13];
  label.textColor = UIColor.grayColor;
  label.textAlignment = NSTextAlignmentCenter;
  label.lineBreakMode = NSLineBreakByTruncatingTail;
  label.backgroundColor = UIColor.clearColor;

  CGFloat maxWidth = CGRectGetWidth(UIScreen.mainScreen.bounds) / 2.0;
  CGSize fitting = [label sizeThatFits:CGSizeMake(maxWidth, RNFormKeyboardToolbarHeight)];
  label.frame = CGRectMake(0, 0, MIN(fitting.width, maxWidth), RNFormKeyboardToolbarHeight);

  return [[UIBarButtonItem alloc] initWithCustomView:label];
}

- (UIBarButtonItem *)flexibleSpace
{
  return [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemFlexibleSpace
                                                       target:nil
                                                       action:nil];
}

- (UIToolbar *)toolbarViewOrCreate
{
  if (_toolbarView != nil) {
    return _toolbarView;
  }
  CGFloat width = CGRectGetWidth(UIScreen.mainScreen.bounds);
  _toolbarView = [[UIToolbar alloc]
      initWithFrame:CGRectMake(0, 0, width, RNFormKeyboardToolbarHeight)];
  _toolbarView.autoresizingMask = UIViewAutoresizingFlexibleWidth;
  return _toolbarView;
}

- (void)detachToolbarFromInputs
{
  if (_toolbarView == nil) {
    return;
  }
  for (UIView *input in [self orderedTextInputs]) {
    if ([self accessoryViewForInput:input] != _toolbarView) {
      continue;
    }
    [self setAccessoryView:nil forInput:input];
    if (input.isFirstResponder) {
      [input reloadInputViews];
    }
  }
}

- (void)toolbarDonePressed
{
  [self endEditing:YES];
}

- (void)toolbarPreviousPressed
{
  [self moveFocusBy:-1];
}

- (void)toolbarNextPressed
{
  [self moveFocusBy:1];
}

- (void)moveFocusBy:(NSInteger)delta
{
  UIView *responder = [self findFirstResponderInView:self];
  if (responder == nil) {
    return;
  }
  NSArray<UIView *> *inputs = [self orderedTextInputs];
  NSUInteger current = [inputs indexOfObject:responder];
  if (current == NSNotFound) {
    return;
  }
  NSInteger target = (NSInteger)current + delta;
  if (target < 0 || target >= (NSInteger)inputs.count) {
    return;
  }
  [inputs[(NSUInteger)target] becomeFirstResponder];
}

@end
