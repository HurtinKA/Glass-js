var Glass = {};
(function(Glass){
    let ctx;
    const constants = WebGL2RenderingContext;

    Glass.static = constants.STATIC_DRAW;
    Glass.dynamic = constants.DYNAMIC_DRAW;

    Glass.triangles = constants.TRIANGLES;
    Glass.lines = constants.LINE_LOOP;
    Glass.points = constants.POINTS;

    Glass.array = constants.ARRAY_BUFFER;
    Glass.index = constants.ELEMENT_ARRAY_BUFFER;


    Glass.createContext = function(canvas){
        const context = {};

        context.canvas = canvas;
        context.gl = canvas.getContext('webgl2');
        context.gl.clearColor(0,0,0,1);

        return context;
    };
    Glass.context = function(context){
        ctx = context;
    };


    Glass.createProgram = function(){
        const program = {};

        program.glProgram = ctx.gl.createProgram();
        program.glVertex = ctx.gl.createShader(constants.VERTEX_SHADER);
        program.glFragment = ctx.gl.createShader(constants.FRAGMENT_SHADER);

        ctx.gl.attachShader(program.glProgram,program.glVertex);
        ctx.gl.attachShader(program.glProgram,program.glFragment);

        return program;
    };
    Glass.vertex = function(program,source){
        source=source.trim();
        ctx.gl.shaderSource(program.glVertex,source);
    };
    Glass.fragment = function(program,source){
        source=source.trim();
        ctx.gl.shaderSource(program.glFragment,source);
    };


    const uniformFunc = {};
    uniformFunc[constants.FLOAT] = function(location,length){
        let f = 'uniform1f';
        length&&(f+='v');
        return function(value){
            ctx.gl[f](location,value[0]);
        };
    };
    uniformFunc[constants.INT] = function(location,length){
        let f = 'uniform1i';
        length&&(f+='v');
        return function(value){
            ctx.gl[f](location,value[0]);
        };
    }
    uniformFunc[constants.FLOAT_VEC2] = function(location,length){
        let f = 'uniform2f';
        length&&(f+='v');
        return function(value){
            ctx.gl[f](location,value[0],value[1]);
        };
    }
    uniformFunc[constants.FLOAT_VEC3] = function(location,length){
        let f = 'uniform3f';
        length&&(f+='v');
        return function(value){
            ctx.gl[f](location,value[0],value[1],value[2]);
        };
    }
    uniformFunc[constants.FLOAT_VEC4] = function(location,length){
        let f = 'uniform4f';
        length&&(f+='v');
        return function(value){
            ctx.gl[f](location,value[0],value[1],value[2],value[3]);
        };
    }
    uniformFunc[constants.FLOAT_MAT2] = function(location){
        return function(value){
            ctx.gl.uniformMatrix2fv(location,false,value);
        };
    }
    uniformFunc[constants.FLOAT_MAT3] = function(location){
        return function(value){
            ctx.gl.uniformMatrix3fv(location,false,value);
        };
    }
    uniformFunc[constants.FLOAT_MAT4] = function(location){
        return function(value){
            ctx.gl.uniformMatrix4fv(location,false,value);
        };
    }


    Glass.compile = function(program){
        ctx.gl.compileShader(program.glVertex);
        ctx.gl.compileShader(program.glFragment);
        ctx.gl.linkProgram(program.glProgram);

        program.uniforms = {};
        for (let i=0; i<ctx.gl.getProgramParameter(program.glProgram,constants.ACTIVE_UNIFORMS); i++){
            const data = ctx.gl.getActiveUniform(program.glProgram,i);

            const uniform = {};

            const name = data.name.replace(/(\[\d+\])(?!\.)/,'');
            uniform.location = ctx.gl.getUniformLocation(program.glProgram,name);
            uniform.function = uniformFunc[data.type](uniform.location,data.length>1);

            program.uniforms[name] = uniform;
        }

        program.attributes = {};
        for (let i=0; i<ctx.gl.getProgramParameter(program.glProgram,constants.ACTIVE_ATTRIBUTES);i++){
            const data = ctx.gl.getActiveAttrib(program.glProgram,i);

            const attribute = {};
            const name = data.name;

            attribute.location = ctx.gl.getAttribLocation(program.glProgram,name);
            ctx.gl.enableVertexAttribArray(attribute.location);

            program.attributes[name] = attribute;
        }
    };
    Glass.useProgram = function(program){
        ctx.gl.useProgram(program.glProgram);
    };


    Glass.createBuffer = function(){
        return {
            glBuffer:ctx.gl.createBuffer(),
            type:constants.ARRAY_BUFFER,
            hint:constants.DYNAMIC_DRAW,
            length:0
        };
    };
    Glass.bufferType = function(buffer,type){
        buffer.type = type;
    };
    Glass.bufferHint = function(buffer,hint){
        buffer.hint = hint;
    };
    Glass.bufferData = function(buffer,data){
        ctx.gl.bindBuffer(buffer.type,buffer.glBuffer);
        ctx.gl.bufferData(buffer.type,data,buffer.hint);
        buffer.length = data.length;
    };
    
    
    Glass.createRead = function(structure){
        let stride = 0;
        for (let i=0; i<structure.length; i+=2){
            stride+=structure[i+1]*4;
        }
        let pointers = [],offset = 0;
        for (let i=0; i<structure.length; i+=2){
            let attrib = structure[i];
            pointers.push(function(){
                ctx.gl.vertexAttribPointer(attrib.location,structure[i+1],constants.FLOAT,false,stride,offset);
                offset+=structure[i+1]*4;
            });
        }
        return {
            pointers:pointers
        };
    };
    Glass.read = function(buffer,instruction){
        ctx.gl.bindBuffer(constants.ARRAY_BUFFER,buffer.glBuffer);
        instruction.pointers.forEach(function(f){
            f();
        });
    };
    
    
    Glass.uniform = function(location,value){
        location.function(value);
    };
    
    
    Glass.clear = function(){
        ctx.gl.clear(constants.COLOR_BUFFER_BIT);
    };
    Glass.draw = function(length,index){
        if (index!=void 0){
            ctx.gl.bindBuffer(index.type,index.glBuffer);
            ctx.gl.drawElements(constants.TRIANGLES,length,constants.UNSIGNED_SHORT,0);
        }
        else{
            ctx.gl.drawArrays(constants.TRIANGLES,0,length);
        }
    };
})(Glass||(Glass={}));
