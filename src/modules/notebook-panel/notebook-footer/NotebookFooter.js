import React, {useState} from 'react';
import {View} from 'react-native';

import {Button} from 'react-native-elements';
import {useSelector} from 'react-redux';

import {isEmpty} from '../../../shared/Helpers';
import IconButton from '../../../shared/ui/IconButton';
import {NOTEBOOK_PAGES, NOTEBOOK_PAGES_ICONS, NOTEBOOK_SUBPAGES} from '../notebook.constants';
import MorePagesMenu from './MorePagesMenu';
import footerStyle from './notebookFooter.styles';

const NotebookFooter = props => {
  const toolbarIcons = useSelector(state => state.notebook.notebookToolbarIcons);
  const notebookPageVisible = useSelector(state => (
    !isEmpty(state.notebook.visibleNotebookPagesStack) && state.notebook.visibleNotebookPagesStack.slice(-1)[0]
  ));
  const [isMorePagesMenuVisible, setIsMorePagesMenuVisible] = useState(false);

  const toolbarIconsKeys = toolbarIcons.filter(i => Object.values(NOTEBOOK_PAGES).includes(i));

  const getPageIcon = (page) => {
    const pageKey = Object.keys(NOTEBOOK_PAGES).find(key => NOTEBOOK_PAGES[key] === page);
    if (notebookPageVisible === page
      || (page === NOTEBOOK_PAGES.MEASUREMENT && notebookPageVisible === NOTEBOOK_SUBPAGES.MEASUREMENTDETAIL)
      || (page === NOTEBOOK_PAGES.SAMPLE && notebookPageVisible === NOTEBOOK_SUBPAGES.SAMPLEDETAIL)) {
      return NOTEBOOK_PAGES_ICONS[pageKey + '_PRESSED'];
    }
    else return NOTEBOOK_PAGES_ICONS[pageKey];
  };

  return (
    <React.Fragment>
      <View style={toolbarIconsKeys.length <= 6 ? footerStyle.footerIconContainer : footerStyle.footerIconContainerWrap}>
        {toolbarIconsKeys.map(icon => (
          <IconButton
            source={getPageIcon(icon)}
            onPress={() => props.openPage(icon)}
          />
        ))}
        <Button
          containerStyle={{alignSelf: 'center'}}
          buttonStyle={{padding: 15}}
          title={'MORE'}
          type='clear'
          titleStyle={footerStyle.morePagesButton}
          onPress={() => setIsMorePagesMenuVisible(true)}
        />
      </View>
      <MorePagesMenu
        visible={isMorePagesMenuVisible}
        closeMorePagesMenu={() => setIsMorePagesMenuVisible(false)}
      />
    </React.Fragment>
  );
};

export default NotebookFooter;
