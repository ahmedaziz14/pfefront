import { StyleSheet, View, Image, FlatList, Pressable } from 'react-native';
import { useSelector } from 'react-redux';

const ProductsScreen = ({ navigation }) => {
  // Utilisation de useSelector pour accéder aux produits dans le store
  const products = useSelector(state => state.products.products);

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => navigation.navigate('Product Detail')}
          style={styles.itemContainer}
        >
          <Image source={{ uri: item.ima }} style={styles.image} />
        </Pressable>
      )}
    />
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    margin: 10, // Ajoute un espacement entre les éléments
    backgroundColor: '#fff', // Couleur de fond pour chaque item
    borderRadius: 8, // Arrondit les coins
    elevation: 2, // Ombre pour Android
    shadowColor: '#000', // Ombre pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  image: {
    width: '100%', // L'image occupera toute la largeur de l'élément
    height: 150, // Hauteur fixe pour l'image
    borderRadius: 8, // Arrondit les coins de l'image
  },
});

export default ProductsScreen;