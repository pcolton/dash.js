require 'rubygems'
require 'closure-compiler'

source = File.read 'json2.js'  

File.open('json2-min.js', 'w+') do |file|
    file.write Closure::Compiler.new.compress(source)
end

