import React from 'react';

import {useSelector} from 'react-redux';

import {isEmpty} from '../../shared/Helpers';
import TablesData from './TablesData';
import UrlData from './URLData';

const DataOverview = () => {
  const spot = useSelector(state => state.spot.selectedSpot);
  return (
    <React.Fragment>
      {!isEmpty(spot.properties?.data?.urls) && <UrlData spot={spot} editable={false}/>}
      {!isEmpty(spot.properties?.data?.tables) && <TablesData spot={spot} editable={false}/>}
    </React.Fragment>
  );
};

export default DataOverview;
