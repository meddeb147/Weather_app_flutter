import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:google_fonts/google_fonts.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

import 'models/constants.dart';
import 'models/weather_item.dart';

class Welcom extends StatefulWidget {
  const Welcom({Key? key});

  @override
  State<Welcom> createState() => _WelcomState();
}


class _WelcomState extends State<Welcom> {
  // fix the declaration of selectedCity to use late keyword
  late String selectedCity = 'Tunis';
  // remove the instantiation of the constants class as it is not needed
  constants Myconstants=constants();
  
  final List<String> cities = [
    'Tunis',
    'Sfax',
    'Sousse',
    'Gabes',
    'Bizerte',
    'Ariana',
    'Kairouan',
    'Gafsa',
    'Monastir',
    'Ben Arous',
  ];

  

Future<String?> getCityName() async {
  // Get the current position
  Position position = await Geolocator.getCurrentPosition(
    desiredAccuracy: LocationAccuracy.high,
  );

  // Get the placemarks using the current position
  var placemarks = await placemarkFromCoordinates(
    position.latitude,
    position.longitude,
  );

  // Extract the city name from the placemarks
  String? cityName = placemarks[0].locality;

  return cityName;
}


  Future<void> getWeatherData(String selectedCity) async {
    final String apiKey = 'fe475e9a727a54e531d37a0929e6fb56';
    final String apiUrl =
        'https://api.openweathermap.org/data/2.5/weather?q=$selectedCity&appid=$apiKey';

    final response = await http.get(Uri.parse(apiUrl));

    if (response.statusCode == 200) {
      final jsonData = json.decode(response.body);
      final double temperatureKelvin = jsonData['main']['temp'];
      final double temperatureCelsius = temperatureKelvin - 273.15;
      int humidity = int.parse(jsonData['main']['humidity'].toString());
      final double windSpeed = jsonData['wind']['speed'];
      final int pressure = jsonData['main']['pressure'];
      final String description = jsonData['weather'][0]['description'];
      setState(() {
        // prefix the variables with 'this.' for clarity and consistency
        this.Temperature = temperatureCelsius.toStringAsFixed(0);
        this.humidity = humidity ;
        this.Wind = windSpeed.toStringAsFixed(2);
        this.Pressure = pressure.toString();
        this.Description = description;
      });
    } else {
      print('no');
    }
  }
  @override
void initState() {
  super.initState();
  getCityName().then((cityName) {
    if (cityName != null) {
      setState(() {
        this.selectedCity = cityName;
      });
      getWeatherData(selectedCity);
    }
  });
  
}

   
  // use 'late' keyword to avoid null safety errors
  late var Temperature='3';
  late var humidity=3;
  late var Wind='h';
  late var Description='clear sky';
  late var Pressure='5';
   
   final formattedDate = DateFormat('MM-dd-yyyy').format(DateTime.now());
  


  //Create a shader linear gradient
  final Shader linearGradient = const LinearGradient(
    colors: <Color>[Color(0xffABCFF2), Color(0xff9AC6F3)],
  ).createShader(const Rect.fromLTWH(0.0, 0.0, 200.0, 70.0));


  @override
Widget build(BuildContext context) {
   Size size=MediaQuery.of(context).size;

  return Scaffold(
    backgroundColor: Colors.white,
      appBar: AppBar(
        
        automaticallyImplyLeading: false,
        centerTitle: false,
        titleSpacing: 0,
        backgroundColor: Colors.white,
        elevation: 0.0,
        title: Container(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          width: size.width,
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              //Our profile image
              ClipRRect(
                borderRadius: const BorderRadius.all(Radius.circular(10)),
                child:  Icon(
            Icons.thermostat,
            size: 40,
            color: Myconstants.primaryColor,
          ),
              ),
              //our selectedCity dropdown
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  Image.asset(
                    'assets/pin.png',
                    width: 20,
                  ),
                  const SizedBox(
                    width: 4,
                  ),
                  DropdownButtonHideUnderline(
                    child: DropdownButton(
                        value: selectedCity,
                        icon: const Icon(Icons.keyboard_arrow_down),
                        items: cities.map((String selectedCity) {
                          return DropdownMenuItem(
                              value: selectedCity, child: Text(selectedCity));
                        }).toList(),
                        onChanged: (String? newValue) {
                          setState(() {
                             selectedCity = newValue!;
                              getWeatherData(selectedCity);
                          });
                        }),
                  )
                ],
              )
            ],
          ),
        ),
      ),
    body: Container(
        padding: const EdgeInsets.fromLTRB(20, 50, 20, 0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.center,
              children:[Text(
                selectedCity,
                style: GoogleFonts.rubikIso(
                  fontWeight: FontWeight.bold,
                  fontSize: 30.0,
                  color: Color.fromARGB(255, 4, 12, 26),
                ),
              ),
               Text(
               
            '$formattedDate',
            style:GoogleFonts.rubikIso(
              fontWeight: FontWeight.w600,
              fontSize: 18,
              color: Myconstants.primaryColor,
            ),)
              ]
            ),
            const SizedBox(
              height: 50,
            ),
            Container(
              width: size.width,
              height: 200,
              decoration: BoxDecoration(
                  color: Myconstants.primaryColor,
                  borderRadius: BorderRadius.circular(15),
                  boxShadow: [
                    BoxShadow(
                      color: Myconstants.primaryColor.withOpacity(.5),
                      offset: const Offset(0, 25),
                      blurRadius: 10,
                      spreadRadius: -12,
                    )
                  ]),
              child: Stack(
                clipBehavior: Clip.none,
                children: [
                  Positioned(
                    top: -40,
                    left: 20,
                    child:  Image.asset(
                      'assets/'+Description.replaceAll(' ', '')+'.png',
                            width: 150,
                          ),
                  ),
                  Positioned(
                    bottom: 30,
                    left: 20,
                    child: Text(
                     Description ,
                      style: GoogleFonts.anton(
                        color: Color.fromARGB(255, 204, 219, 227),
                        fontSize: 20,
                      ),
                    ),
                  ),
                  Positioned(
                    top: 20,
                    right: 20,
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Padding(
                          padding: const EdgeInsets.only(top: 4.0),
                          child: Text(
                            Temperature,
                            style: TextStyle(
                              fontSize: 90,
                              fontWeight: FontWeight.bold,
                              foreground: Paint()..shader = linearGradient,
                            ),
                          ),
                        ),
                        Text(
                          'o',
                          style: TextStyle(
                            fontSize: 40,
                            fontWeight: FontWeight.bold,
                            foreground: Paint()..shader = linearGradient,
                          ),
                        )
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(
              height: 50,
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                 
                ],
              ),
            ),
            const SizedBox(
              height: 17,
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 40),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  weatherItem(
                    text: 'Wind Speed',
                    value: Wind,
                    unit: 'km/h',
                    imageUrl: 'assets/windspeed.png',
                  ),
                  weatherItem(
                      text: 'Humidity',
                      value: humidity.toString(),
                      unit: '',
                      imageUrl: 'assets/humidity.png'),
                  weatherItem(
                    text: 'Pressure',
                    value: Pressure.toString(),
                    unit: 'hPa',
                    imageUrl: 'assets/max-temp.png',
                  ),
                ],
              ),
            ),
             const SizedBox(
              height: 50,
            ),
           
            
          
          ],
        ),
      ),
  );
}}