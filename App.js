/**
 * Vídeo #1 ao #23: Localização - Módulo 18 - Notificações - B7Web
 * Adiquirindo conhecimento em features avançadas: Trabalhando com notificações no cliente (também a assunto para o lado server, o Firebase).
 * by: Vagner Pinto
 */

import React from 'react';
import {View, Text} from 'react-native';
import firebase from 'react-native-firebase';


export default class App extends React.Component{

    constructor(props) {
        super(props);

        this.checkPermission = this.checkPermission.bind(this);
    }

    checkPermission(){
        firebase.messaging();
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Text>Notificações</Text>
            </View>
        );
    }

    componentDidMount(){
        this.checkPermission();
    }
}
