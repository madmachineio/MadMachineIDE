/*
  Mission7 DC Motor

  What you should see?
  Turning the potentiometer will cause the motor rotate in a different speed.

  The circuit:
  - Use Potentiometer Module, and connect it to an Analog Jack.
  - Use Motor Driver Module, and connect it to a Digital Jack.

  created 2019
  by Orange J

  Try changing the motor rotate in a diverse direction. What else can you do?
  This example code is in the public domain.
  Visit madmachine.io for more.
*/

import SwiftIO

func main() {
	let a0 = AnalogIn(.A0)
  	let motor = PWMOut(.PWM3, period: 1000, pulse: 0)
  	
  	while true {
      	let value = a0.readPercent()
        
      	motor.setDutycycle(value)        // public func setDutycycle(_ dutycycle: Float)
      	sleep(ms: 50)
    }
}
