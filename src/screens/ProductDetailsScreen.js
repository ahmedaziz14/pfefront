import { StyleSheet, Text, View, Image, FlatList, useWindowDimensions,
    ScrollView, Pressable } from 'react-native';
    import products from '../data/product';

    const addToCart = () => {
        console.warn('add to cart');
        };

const ProductDetailsScreen = () => {
    const product = products[0];
    const { width } = useWindowDimensions();
   return (
    <View>
    <ScrollView>
    <FlatList
    data={product.images}
    renderItem={({ item }) => (
    <Image source={{ uri: item }} style={{ width, aspectRatio: 1 }} />
    )}
    horizontal
    showsHorizontalScrollIndicator={false}
    pagingEnabled
    />
    <View style={{ padding: 20 }}>
    <Text style={styles.title}>{product.name}</Text>
    <Text style={styles.price}>${product.price}</Text>
    <Text style={styles.description}>{product.description}</Text>
 </View>
 </ScrollView>
 <Pressable onPress={addToCart} style={styles.button}>
<Text style={styles.buttonText}>Add to cart</Text>
</Pressable>
 </View>
 );
 

}
export default ProductDetailsScreen;
const styles = StyleSheet.create({
    title: {
    fontSize: 34,
    fontWeight: 'bold',
 marginVertical: 10,
 },
 price: {
 fontWeight: '500',
 fontSize: 16,
 letterSpacing: 1.5,
 },
 description: {
    marginVertical: 10,
    fontSize: 8,
    lineHeight: 30,
    fontWeight: '300'
    },
     button: {
 position: 'absolute',
 backgroundColor: 'black',
 bottom: 30,
 width: '90%',
 alignSelf: 'center',
 padding: 20,
 borderRadius: 100,
 alignItems: 'center'
 },
 button: {
    position: 'absolute',
    backgroundColor: 'black',
    bottom: 30,
    width: '90%',
    alignSelf: 'center',
    padding: 20,
    borderRadius: 100,
    alignItems: 'center'
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
        }
       });
  

       