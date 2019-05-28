import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    flex: 1,
    backgroundColor: 'lightgrey',
  },
  button: {
    flexDirection: 'row',
    paddingLeft: 7,
    paddingRight: 5
  },
  textStyle: {
    fontSize: 14,
    color: '#407ad9',
  },
  headingText: {
    alignItems: 'center',
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 0
  },
  icons: {
    height: 50,
    width: 40,
  },
  itemContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 7,
    paddingBottom: 3,
    paddingLeft: 10
  },
  itemSubContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 3,
    paddingBottom: 7,
    paddingLeft: 20
  },
  itemTextStyle: {
    fontSize: 18,
    marginLeft: 15,
  },
  itemSubTextStyle: {
    fontSize: 14,
    marginLeft: 15,
  },
  buttonPadding: {
    paddingLeft: 10
  },
  switch: {
    flex: 1,
    alignItems: 'flex-end'
  },
  centertext: {
    alignItems: 'center',
    paddingTop: 10
  },
  rightlink: {
    width: '90%',
    textAlign: "right",
    paddingTop: 20,
    fontSize: 14,
    color: '#407ad9'
  },
  dividerText: {
    fontSize: 15,
    paddingLeft: 10,
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  divider: {
    height: 30,
    justifyContent: 'center'
  },
  submitButton: {
    width: '90%',
    textAlign: "center",
    paddingTop: 20,
    fontSize: 14,
    color: '#407ad9'
  }
});

export default styles;