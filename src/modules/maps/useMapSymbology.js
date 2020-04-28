const useMapSymbology = (props) => {

  // Get the rotation of the symbol, either strike, trend or failing both, 0
  const getIconRotation = () => {
    return [
      'case',
      ['has', 'strike', ['get', 'orientation']], ['get', 'strike', ['get', 'orientation']],
      ['case',
        ['has', 'dip_direction', ['get', 'orientation']], ['%', ['-', ['get', 'dip_direction', ['get', 'orientation']], 90], 360],
        ['case',
          ['has', 'trend', ['get', 'orientation']], ['get', 'trend', ['get', 'orientation']],
          0,
        ],
      ],
    ];
  };

  // Get the label for the point symbol, either dip, plunge or failing both, the Spot name
  const getPointLabel = () => {
    return [
      'case', ['has', 'orientation'],
      ['case',
        ['has', 'plunge', ['get', 'orientation']], ['get', 'plunge', ['get', 'orientation']],
        ['case',
          ['has', 'dip', ['get', 'orientation']], ['get', 'dip', ['get', 'orientation']],
          ['get', 'name'],
        ],
      ],
      ['get', 'name'],
    ];

    // Does not work on iOS - iOS doesn't build if there is more than 1 condition and a fallback in a case expression
    /*return ['case', ['has', 'orientation'],
     ['case',
     ['has', 'dip', ['get', 'orientation']], ['get', 'dip', ['get', 'orientation']],
     ['has', 'plunge', ['get', 'orientation']], ['get', 'plunge', ['get', 'orientation']],
     ['get', 'name'],
     ],
     ['get', 'name'],
     ];*/
  };

  // Get the label offset, which is further to the right if the symbol rotation is between 60-120 or 240-300
  const getLabelOffset = () => {
    return ['case', ['has', 'orientation'],
      // Variable bindings
      ['let',
        'rotation',
        ['case',
          ['has', 'strike', ['get', 'orientation']], ['get', 'strike', ['get', 'orientation']],
          ['case',
            ['has', 'dip_direction', ['get', 'orientation']], ['%', ['-', ['get', 'dip_direction', ['get', 'orientation']], 90], 360],
            ['case',
              ['has', 'trend', ['get', 'orientation']], ['get', 'trend', ['get', 'orientation']],
              0,
            ],
          ],
        ],

        // Output
        ['case',
          // Symbol rotation between 60-120 or 240-300
          ['any',
            ['all',
              ['>=', ['var', 'rotation'], 60],
              ['<=', ['var', 'rotation'], 120],
            ],
            ['all',
              ['>=', ['var', 'rotation'], 240],
              ['<=', ['var', 'rotation'], 300],
            ],
          ], ['literal', [2, 0]],     // Need to specifiy 'literal' to return an array in expressions
          // Default
          ['literal', [0.75, 0]],
        ],
      ],
      ['literal', [0.75, 0]],
    ];
  };

  // Get the image for the symbol
  const getIconImage = () => {
    return ['case', ['has', 'orientation'],
      // Variable bindings
      ['let',
        'symbol_orientation',
        ['case',
          ['has', 'dip', ['get', 'orientation']], ['get', 'dip', ['get', 'orientation']],
          ['case',
            ['has', 'plunge', ['get', 'orientation']], ['get', 'plunge', ['get', 'orientation']],
            0,
          ],
        ],
        ['let',
          'feature_type',
          ['get', 'feature_type', ['get', 'orientation']],

          // Output
          ['case',
            // Case 1: Orientation has facing
            ['all',
              ['==', ['get', 'facing', ['get', 'orientation']], 'overturned'],
              ['any',
                ['==', ['var', 'feature_type'], 'bedding'],
              ],
            ], ['concat', ['get', 'feature_type', ['get', 'orientation']], '_overturned'],
            ['case',
              // Case 2: Symbol orientation is 0 and feature type is bedding or foliation
              ['all',
                ['==', ['var', 'symbol_orientation'], 0],
                ['any',
                  ['==', ['var', 'feature_type'], 'bedding'], ['==', ['var', 'feature_type'], 'foliation'],
                ],
              ], ['concat', ['var', 'feature_type'], '_horizontal'],
              ['case',
                // Case 3: Symbol orientation between 0-90 and feature type is bedding, contact, foliation or shear zone
                ['all',
                  ['>', ['var', 'symbol_orientation'], 0],
                  ['<', ['var', 'symbol_orientation'], 90],
                  ['any',
                    ['==', ['var', 'feature_type'], 'bedding'], ['==', ['var', 'feature_type'], 'contact'],
                    ['==', ['var', 'feature_type'], 'foliation'], ['==', ['var', 'feature_type'], 'shear_zone'],
                  ],
                ], ['concat', ['var', 'feature_type'], '_inclined'],
                ['case',
                  // Case 4: Symbol orientation is 90 and feature type is bedding, contact, foliation or shear zone
                  ['all',
                    ['==', ['var', 'symbol_orientation'], 90],
                    ['any',
                      ['==', ['var', 'feature_type'], 'bedding'], ['==', ['var', 'feature_type'], 'contact'],
                      ['==', ['var', 'feature_type'], 'foliation'], ['==', ['var', 'feature_type'], 'shear_zone'],
                    ],
                  ], ['concat', ['var', 'feature_type'], '_vertical'],
                  ['case',
                    // Case 5: Other features with no symbol orienation
                    ['all',
                      ['has', 'feature_type', ['get', 'orientation']],
                      ['any',
                        ['==', ['var', 'feature_type'], 'fault'], ['==', ['var', 'feature_type'], 'fracture'],
                        ['==', ['var', 'feature_type'], 'vein'],
                      ],
                    ], ['get', 'feature_type', ['get', 'orientation']],
                    ['case',
                      // Defaults
                      ['==', ['get', 'type', ['get', 'orientation']], 'linear_orientation'], 'lineation_general',
                      'default_point',
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
      'default_point',
    ];
  };

  const mapStyles = {
    point: {
      textIgnorePlacement: true,  // Need to be able to stack symbols at same location
      textField: getPointLabel(),
      textAnchor: 'left',
      textOffset: getLabelOffset(),
      iconImage: getIconImage(),
      iconRotate: getIconRotation(),
      iconAllowOverlap: true,     // Need to be able to stack symbols at same location
      iconIgnorePlacement: true,  // Need to be able to stack symbols at same location
      iconSize: 0.08,
      symbolSpacing: 0,
    },
    line: {
      lineColor: 'black',
      lineWidth: 3,
    },
    polygon: {
      fillColor: 'blue',
      fillOpacity: 0.4,
    },
    pointSelected: {
      circleRadius: 30,
      circleColor: 'orange',
      circleOpacity: 0.4,
    },
    lineSelected: {
      lineColor: 'orange',
      lineWidth: 3,
    },
    polygonSelected: {
      fillColor: 'orange',
      fillOpacity: 0.7,
    },
    pointDraw: {
      circleRadius: 5,
      circleColor: 'orange',
      circleStrokeColor: 'white',
      circleStrokeWidth: 2,
    },
    lineDraw: {
      lineColor: 'orange',
      lineWidth: 3,
      lineDasharray: [2, 2],
    },
    polygonDraw: {
      fillColor: 'orange',
      fillOpacity: 0.4,
    },
    pointEdit: {
      circleRadius: 10,
      circleColor: 'orange',
      circleStrokeColor: 'white',
      circleStrokeWidth: 2,
    },
  };

  const getMapSymbology = () => {
    return mapStyles;
  };

  return [{
    getMapSymbology: getMapSymbology,
  }];
};

export default useMapSymbology;
